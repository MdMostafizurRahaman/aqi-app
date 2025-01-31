import React, { useState, useEffect, useContext } from 'react';
import "../index.css";
import { Mycontext } from "../App";
import formula from "../assets/images/forecasting.webp"

const AqiForecast = () => {

    const context = useContext(Mycontext);
    const { currentLocationData} = context;
    const [forecastData, setForecastData] = useState([]);
    useEffect(() => {
        fetchForecast();
    }, []);

    const fetchForecast = async () => {
        try {

            const forecast = currentLocationData.aqiDataJson.data.forecast.daily;
            let formattedData = forecast.pm25.map((item, index) => {
                const pm10Data = forecast.pm10 && forecast.pm10[index] ? forecast.pm10[index].avg : "N/A";
                const o3Data = forecast.o3 && forecast.o3[index] ? forecast.o3[index].avg : "N/A";

                return {
                    date: item.day,
                    pm25: item.avg,
                    pm10: pm10Data,
                    o3: o3Data,
                    predictedAQI: pm10Data !== "N/A" && o3Data !== "N/A" ? calculateAQI(item.avg, pm10Data, o3Data) : "N/A"
                };
            });

            setForecastData(formattedData);
        } catch (error) {
            console.error("Error fetching forecast:", error);
        }
    };

    const getAQI = (concentration, breakpoints) => {
        for (let [C_low, C_high, I_low, I_high] of breakpoints) {
            if (concentration >= C_low && concentration <= C_high) {
                return Math.round(((I_high - I_low) / (C_high - C_low)) * (concentration - C_low) + I_low);
            }
        }
        return 0;
    };

    const calculateAQI = (pm25, pm10, o3) => {
        const pm25Breakpoints = [[0, 12, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150], [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500.4, 301, 500]];
        const pm10Breakpoints = [[0, 54, 0, 50], [55, 154, 51, 100], [155, 254, 101, 150], [255, 354, 151, 200], [355, 424, 201, 300], [425, 604, 301, 500]];
        const o3Breakpoints = [[0, 54, 0, 50], [55, 70, 51, 100], [71, 85, 101, 150], [86, 105, 151, 200], [106, 200, 201, 300]];

        let aqiPM25 = getAQI(pm25, pm25Breakpoints);
        let aqiPM10 = getAQI(pm10, pm10Breakpoints);
        let aqiO3 = getAQI(o3, o3Breakpoints);

        return Math.max(aqiPM25, aqiPM10, aqiO3);
    };

    return (
        <div className="airForcastingWrapper">
            <h2 className="aqiforecast-title">AQI Forecast Of Dhaka</h2>
            <table className="aqiforecast-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>PM2.5</th>
                        <th>PM10</th>
                        <th>O3</th>
                        <th>Predicted AQI</th>
                    </tr>
                </thead>
                <tbody>
                    {forecastData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.date}</td>
                            <td>{item.pm25} µg/m³</td>
                            <td>{item.pm10}</td>
                            <td>{item.o3}</td>
                            <td>{item.predictedAQI}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 className="aqiforecast-subtitle">How AQI is Calculated</h3>
            <img src={formula} alt="" />
        </div>
    );
};

export default AqiForecast;
