const apiKey = "574436d029226e1a319091dc793b17fa";

function getWeather() {
    const city = document.getElementById("cityInput").value.trim();

    if(city == ""){
        alert("Please enter a city name");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        if(data.cod === "404") {
            document.getElementById("weather-result").innerHTML = `<p class="error">City not found! Try again.</p>`;
            return;
        }

        document.getElementById("weather-result").innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <h3><i class="fas fa-thermometer-half" style="font-size: 30px; color:rgb(255, 136, 0);"></i> ${data.main.temp}°C</h3>
            <div class="weather-details">
                <div class="weather-card">
                    <img class="weather-icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
                    <strong>${data.weather[0].description}</strong>
                </div>
                <div class="weather-card">
                    <i class="fas fa-tint" style="font-size: 50px; color: #007bff;"></i>
                    <strong>Humidity:</strong> ${data.main.humidity}%
                </div>
                <div class="weather-card">
                    <i class="fas fa-thermometer-half" style="font-size: 50px; color: #007bff;"></i>
                    <strong>Feels Like:</strong> ${data.main.feels_like}°C
                </div>
                <div class="weather-card">
                    <i class="fas fa-wind" style="font-size: 50px; color: #007bff;"></i>
                    <strong>Wind Speed:</strong> ${data.wind.speed} m/s
                </div>
                <div class="weather-card">
                    <i class="fas fa-tachometer-alt" style="font-size: 50px; color: #007bff;"></i>
                    <strong>Pressure:</strong> ${data.main.pressure} hPa
                </div>
                <div class="weather-card">
                    <i class="fas fa-eye" style="font-size: 50px; color: #007bff;"></i>
                    <strong>Visibility:</strong> ${data.visibility / 1000} km
                </div>
                <div class="weather-card">
                    <i class="fas fa-cloud" style="font-size: 50px; color: #007bff;"></i>
                    <strong>Cloudiness:</strong> ${data.clouds.all}%
                </div>
                <div class="weather-card">
                    <img class="icon" src="https://img.icons8.com/ios/50/000000/sunrise.png" alt="Sunrise Icon">
                    <strong>Sunrise:</strong> ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}
                </div>
                <div class="weather-card">
                    <img class="icon" src="https://img.icons8.com/ios/50/000000/sunset.png" alt="Sunset Icon">
                    <strong>Sunset:</strong> ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}
                </div>
                <div class="weather-card">
                    <i class="fas fa-clock" style="font-size: 30px; color: #007bff;"></i>
                    <strong>Last Updated:</strong> ${new Date(data.dt * 1000).toLocaleString()}
                </div>
            </div>
        `;
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        document.getElementById("weather-result").innerHTML = `<p class="error">Something is wrong.</p>`;
    });
}

// Function to get weather using coordinates
function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            getWeather();  // Call the original function to display weather
        })
        .catch(error => console.error("Error fetching data: ", error));
}

// Function to get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            (error) => {
                console.log("Geolocation error: ", error);
                alert("Could not get the location. Please enter a city manually.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.")
    }
}

// Call function on page load
document.addEventListener("DOMContentLoaded", getUserLocation);

// Function for the dark mode handling
document.getElementById("darkModeToggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    // Save preferences to local storage
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
});

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
}

// Function to add 5-days forecast
function getWeatherForecast() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.cod !== "200") {
                alert("City not found! Please try again.");
                return;
            }

            let forecastHTML = "<h3>5-Day Forecast</h3>";
            const middayForecasts = data.list.filter(item => {
                const date = new Date(item.dt * 1000);
                return date.getHours() === 12; // Filter for forecasts at noon
            });

            middayForecasts.forEach(day => {
                const date = new Date(day.dt * 1000).toLocaleDateString(); // Just the date
                const icon = day.weather[0].icon;
                const temp = day.main.temp;

                forecastHTML += `
                    <div class="forecast-card">
                        <p><strong>${date}</strong></p>
                        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">                    
                        <p>${temp} °C</p>
                    </div>`;
            });

            document.getElementById("forecast").innerHTML = forecastHTML;
        })
        .catch(error => console.error("Error Fetching forecast: ", error));
}

function saveSearch(city) {
    let searches = JSON.parse(localStorage.getItem("searchHistory")) || [];

    if (!searches.includes(city)) {
        searches.push(city);

        // Limit the number of saved searches to 5
        if (searches.length > 5) {
            searches.shift(); // Remove the oldest search
        }
        localStorage.setItem("searchHistory", JSON.stringify(searches));
    }

    displaySearchHistory();
}

function displaySearchHistory() {
    let searches = JSON.parse(localStorage.getItem("searchHistory")) || [];
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = ""; // Clear existing history

    searches.forEach(city => {
        let listItem = document.createElement("li"); // Corrected here
        listItem.innerHTML = `<button onclick="getWeatherByCity('${city}')">${city}</button>`;
        historyList.appendChild(listItem);
    });
}

// Load search history on page load
document.addEventListener("DOMContentLoaded", displaySearchHistory);


if("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js")
        .then(() => console.log("Service Worker Register"))
        .catch(error => console.log("Service Worker Error: ", error));
}