const apiKey = '5abeac2443644ed23c58302de081a02a';

const clearStorageButton = document.getElementById('clear-storage');
clearStorageButton.addEventListener('click', clearLocalStorage);

document.getElementById('search-form').addEventListener('submit', performSearch);

window.addEventListener('DOMContentLoaded', () => {
    displaySearchHistory();
});

async function performSearch(event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value.trim();
    const state = document.getElementById('state-input').value.trim();

    if (!city || !state) {
        displayError('Please enter a city name and select a state.');
        return;
    }

    const query = `${city},${state},us`;
    try {
        await fetchCurrentWeather(query);
        await fetchForecast(query);
        addToSearchHistory(city, state);
        saveToLocalStorage(city, state);
        displaySearchHistory();
    } catch (error) {
        displayError(error.message);
    }
}

async function fetchCurrentWeather(query) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch weather data.');
        }
        const data = await response.json();
        displayCurrentWeather(data);
    } catch (error) {
        displayError(error.message);
    }
}

async function fetchForecast(query) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch weather data.');
        }
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        displayError(error.message);
    }
}

function displayCurrentWeather(data) {
    const weatherDiv = document.getElementById('current-weather');
    weatherDiv.innerHTML = `
        <h2>${data.name}, ${getStateName(data.sys.country)}</h2>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}" style="width: 50px; height: 50px;" />
        <p>Temperature: ${data.main.temp} °C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} meter/sec</p>
    `;
}

function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const dailyData = data.list[i];
        forecastDiv.innerHTML += `
            <div class="card">
                <div class="card-body">
                    <h5>${new Date(dailyData.dt * 1000).toLocaleDateString()}</h5>
                    <img src="https://openweathermap.org/img/wn/${dailyData.weather[0].icon}.png" alt="${dailyData.weather[0].description}" />
                    <p>Temp: ${dailyData.main.temp} °C</p>
                    <p>Humidity: ${dailyData.main.humidity}%</p>
                    <p>Wind Speed: ${dailyData.wind.speed} meter/sec</p>
                </div>
            </div>
        `;
    }
}

function addToSearchHistory(city, state) {
    const searchHistory = document.getElementById('search-history');
    const listItem = document.createElement('li');
    listItem.textContent = `${city}, ${state}`;
    listItem.className = 'list-group-item';
    listItem.addEventListener('click', () => {
        document.getElementById('city-input').value = city;
        document.getElementById('state-input').value = state;
        const query = `${city},${state},us`;
        fetchCurrentWeather(query);
        fetchForecast(query);
    });
    searchHistory.appendChild(listItem);
}

function getStateName(state) {
    const stateSelect = document.getElementById('state-input');
    return stateSelect.options[stateSelect.selectedIndex].text;
}

function displayError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

function clearLocalStorage() {
    localStorage.clear();
    const searchHistory = document.getElementById('search-history');
    searchHistory.innerHTML = '';
}

function displaySearchHistory() {
    const searchHistory = document.getElementById('search-history');
    searchHistory.innerHTML = '';

    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];

    for (const item of history) {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.city}, ${item.state}`;
        listItem.className = 'list-group-item';
        listItem.addEventListener('click', () => {
            const query = `${item.city},${item.state},us`;
            fetchCurrentWeather(query);
            fetchForecast(query);
        });
        searchHistory.appendChild(listItem);
    }
}

function saveToLocalStorage(city, state) {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory.push({ city, state });
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}
