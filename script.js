const apiKey = '5abeac2443644ed23c58302de081a02a';

document.getElementById('search-form').addEventListener('submit', performSearch);

async function performSearch(event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value.trim();
    
    if (!city) {
        displayError('Please enter a city name.');
        return;
    }
    
    try {
        await fetchCurrentWeather(city);
        await fetchForecast(city);
        addToSearchHistory(city);
    } catch (error) {
        displayError(error.message);
    }
}

async function fetchCurrentWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch current weather.');
    }
    
    const data = await response.json();
    displayCurrentWeather(data);
}

async function fetchForecast(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch weather forecast.');
    }
    
    const data = await response.json();
    displayForecast(data);
}

function displayCurrentWeather(data) {
    const currentWeatherDiv = document.getElementById('current-weather').querySelector('.card-body');
    const weatherIcon = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    currentWeatherDiv.innerHTML = `
        <h2 class="h5">${data.name} (${new Date().toLocaleDateString()}) <img src="${weatherIcon}" alt="weather icon"></h2>
        <p>Temperature: ${data.main.temp} °C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';
    
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const weatherIcon = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
        forecastDiv.innerHTML += `
            <div class="card m-2" style="width: 12rem;">
                <div class="card-body">
                    <h5 class="card-title">${new Date(forecast.dt_txt).toLocaleDateString()}</h5>
                    <img src="${weatherIcon}" alt="weather icon">
                    <p class="card-text">Temp: ${forecast.main.temp} °C</p>
                    <p class="card-text">Humidity: ${forecast.main.humidity}%</p>
                    <p class="card-text">Wind Speed: ${forecast.wind.speed} m/s</p>
                </div>
            </div>
        `;
    }
}

function addToSearchHistory(city) {
    const searchHistory = document.getElementById('search-history');
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.textContent = city;
    listItem.addEventListener('click', async () => {
        try {
            await fetchCurrentWeather(city);
            await fetchForecast(city);
        } catch (error) {
            displayError(error.message);
        }
    });
    searchHistory.appendChild(listItem);
}

function displayError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}