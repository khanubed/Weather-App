const apiKey = "21dc62c19b1eeb2a8469e6a0e9a552d9";

//--------DOM-----------
const cityInput=document.getElementById("cityInput");
const cityName=document.getElementById("cityName");
const date=document.querySelector(".date");
const emojiBox=document.getElementById("emojiBox");
const tempValue=document.getElementById("tempValue");
const statusValue=document.getElementById("statusValue");
const humidityValue=document.getElementById("humidityValue");
const windValue=document.getElementById("windValue");
const forecastBox=document.querySelector(".forecastBox")
const searchBTN = document.getElementById("searchBTN");
const sectionSearch = document.querySelector(".searchScreen")
const sectionError = document.querySelector(".errorScreen")
const sectionInfo = document.querySelector("#sectionInfo")
const main = document.querySelector(".mainBox");

//-----------Event Listners
searchBTN.addEventListener("click",()=>{
    if(cityInput.value != ""){
        getWeather(cityInput.value);
        cityInput.value="";
    }
    
}); 
cityInput.addEventListener("keydown", (event)=>{
    if(event.key == 'Enter' && cityInput.value.trim() != ""){
        
        getWeather(cityInput.value);
        getForecast(cityInput.value);
        
        cityInput.value="";
    }
}); 

//----------Getting Weather Info

async function getWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod==="404") {
            showDisplaySection(sectionError);
            sectionError.style.display='flex';
            main.classList.add('error');
            setTimeout(() => {
                main.classList.remove('error');
            }, 1000);

            return
        }
        showDisplaySection(sectionInfo);
        cityName.innerText=`${data.name}, ${data.sys.country}`;
        date.innerText=`${getCurrentDate()}`;
        tempValue.innerText=`${Math.round(data.main.temp)}`;
        humidityValue.innerText=`${data.main.humidity}`;
        windValue.innerText=`${Math.round((data.wind.speed)*3.6)} km/h`;
        statusValue.innerText=` ${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}`;
        emojiBox.style.backgroundImage=`url(assets/${getEmoji(data.weather[0].id)})`;
        

    } catch (error) {
        
    }
}

// Utility Functions

function showDisplaySection(section) {
    [sectionInfo,sectionError,sectionSearch].forEach(element => {
        element.style.display = 'none'; 
    });
    section.style.display = 'block';
}

function getCurrentDate() {
    const currentDate = new Date();
    const format = {
        weekday : "short",
        day : "2-digit",
        month : "short",
        getYear:"4-digit"
        
    }
    return currentDate.toLocaleDateString('en-GB',format)   
}

function getEmoji(id) {
    if (id<=232) {
        return "thunderstorm.webp";
    }
    if (id<=321) {
        return "showerrain.webp";
    }
    if (id<=531) {
        return "rain.webp";
    }
    if (id<=622) {
        return "snow.webp";
    }
    if (id<=781) {
        return "mist.webp";
    }
    if (id==800) {
        return "clearsky.webp";
    }
    if (id==801) {
        return "fewclouds.webp";
    }
    if (id==802) {
        return "scatteredclouds.webp";
    }
    if (id==803||id==804) {
        return "brokenclouds.webp";
    }
}
//--------------Getting Forecast

async function getForecast(city){
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const forecastData = await response.json();
        const timeTaken = '00:00:00';
        const todayDate = new Date().toISOString().split("T")[0];
        forecastBox.innerHTML='';
        forecastData.list.forEach(element => {
            if (element.dt_txt.includes(timeTaken) && !element.dt_txt.includes(todayDate) ) {
                updateForecastItems(element);
                console.log(element);
            }
            
        });

        
    } 
    catch (error){
        
    }
    
}

function updateForecastItems(weatherData) {
    
    const {
        dt_txt: date,
        weather : [{ id }],
        main: {temp}
    } = weatherData ;

    const dateTaken = new Date(date);
    const dateReq = {
        day : "2-digit",
        month : "short"
    }

    const dateResult = dateTaken.toLocaleDateString("en-US",dateReq);

    const forecastItem = `
            <div class="forecastItem">
                <h5 class="forecastDate">${dateResult} </h5>
                <img src="assets/${getEmoji(id)}" class="forecastEmoji"></img>
                <h4 class="forecastTemp">${Math.round(temp)} <sup style="font-size: 10px;">o</sup>C</h4>
            </div>
    `;
    forecastBox.insertAdjacentHTML('beforeend',forecastItem)
    
} 

//-------------------Getting weather by geolocation

navigator.geolocation.getCurrentPosition((position) => {
    try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
    getWeatherByCoords(lat, lon);    
    } catch (error) {
        console.error(error);
    }
});

async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if(data.cod==200){
            showDisplaySection(sectionInfo);
            cityName.innerText=`${data.name}, ${data.sys.country}`;
            date.innerText=`${getCurrentDate()}`;
            tempValue.innerText=`${Math.round(data.main.temp)}`;
            humidityValue.innerText=`${data.main.humidity}`;
            windValue.innerText=`${Math.round((data.wind.speed)*3.6)} km/h`;
            statusValue.innerText=` ${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}`;
            emojiBox.style.backgroundImage=`url(assets/${getEmoji(data.weather[0].id)})`;
            getForecast(data.name);
        }
        
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}
