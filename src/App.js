import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import './App.scss';

function App() {
    const [countryName, setCountryName] = useState('Norway');
    const [cases, setCases] = useState([]);
    const [deaths, setDeaths] = useState([]);
    const [recovered, setRecovered] = useState([]);
    const [countries, setCountries] = useState([]);

    const convertTimeline = timeline => Object.keys(timeline).map(d => ({
        day:   new Date(d),
        value: timeline[d]
    })).sort((a, b) => a.day - b.day);

    useEffect(() => {
        fetch(`https://corona.lmao.ninja/v2/historical/${countryName}`).then(res => res.json().then(data => {
            const timeline = data.timeline;
            if (!timeline) return;
            const cases = convertTimeline(timeline.cases);
            const firstCase = cases.filter(d => d.value === 0).length;
            setCases(() => cases.slice(firstCase));
            setDeaths(() => convertTimeline(timeline.deaths).slice(firstCase));
            setRecovered(() => convertTimeline(timeline.recovered).slice(firstCase));
        }));

        fetch('https://corona.lmao.ninja/countries').then(res => res.json().then(countries => {
            setCountries(() => countries);
        }));
    }, [ countryName ]);

    return (
        <div className="App">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                  title: { text: `2020 Corona pandemic in ${countryName}` },
                  xAxis: { categories: cases.map(o => o.day.toDateString().slice(4)) },
                  yAxis: { title: { text: 'Amount of people' } },
                  chart: { width: window.innerWidth * .8 },
                  colors: ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'],
                  series: [
                      { name: 'Cases', data: cases.map(o => o.value) },
                      { name: 'Dead', data: deaths.map(o => o.value) },
                      { name: 'Recovered', data: recovered.map(o => o.value) }
                  ]
              }}
            />
            <div className='countries'>
                {countries.map(c => (
                    <div
                        key={c.country}
                        className={'country' + (c.country === countryName ? ' current' : '')}
                        onClick={() => setCountryName(c.country)}
                    >
                        <img src={c.countryInfo.flag} />
                        <div className='stats'>
                            <div className='name'>{c.countryInfo.iso3}</div>
                            <div className='cases'>{c.cases}</div>
                            <div className='critical'>{c.critical}</div>
                            <div className='deaths'>{c.deaths}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
