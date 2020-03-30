import React, {createContext, useContext, useEffect, useState} from 'react';

import * as cities from './cities.json';

const DataContext = createContext();

export function DataProvider(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [clickedCity, setClickedCity] = useState(null)

    useEffect(() => {
        fetch("https://dev.secrule.io/api/v1/covid-19/sd")
            .then(res => res.json())
            .then(res => pretty(res))
            .then(
                (result) => {
                    setData(processData(result));
                    setIsLoading(false)
                },
                (error) => {
                    console.log('error in retriving data.')
                });
    }, []);

    return (<
            DataContext.Provider value={
            {
                isLoading,
                ...data,
                clickedCity,
                setClickedCity
            }
        } {
                                     ...props
                                 }
        />
    )
}

export function useData() {
    return useContext(DataContext);
}


function processData(apiResult) {
    if (apiResult.success === 'false') return {};
    let data = apiResult.data;
    const len = data.length;

    let parsedCases = [];
    for (let i = 0; i < len; i++) {
        parsedCases.push(parseCases(data, i))
    }

    let finalDatabase = parsedCases[0];
    finalDatabase['cities'] = cities['cities'];

    for (let i = 1; i < len; i++) {
        for (let j in parsedCases[i].cases) finalDatabase['cases'].push(parsedCases[i]['cases'][j]);
        for (let j in parsedCases[i].cures) finalDatabase['cures'].push(parsedCases[i]['cures'][j]);
        for (let j in parsedCases[i].deaths) finalDatabase['deaths'].push(parsedCases[i]['deaths'][j]);
    }
    console.log(finalDatabase);
    return finalDatabase;
}

// Parse Cases according to old database
function parseCases(data, targetDay) {
    let day = data[targetDay].day;
    let targetCases = data[targetDay].regional;
    let cases = [],
        deaths = [],
        cures = [];

    for (let i in targetCases) {
        let caseConfirmed = {
            "city": targetCases[i].loc,
            "count": targetCases[i].count,
            "date": day
        }
        cases.push(caseConfirmed);
        if (parseInt(targetCases[i].deaths) !== 0) {
            let death = {
                "city": targetCases[i].loc,
                "count": targetCases[i].deaths,
                "date": day
            }
            deaths.push(death);
        }
        if (parseInt(targetCases[i].discharged) !== 0) {
            let cure = {
                "city": targetCases[i].loc,
                "count": targetCases[i].discharged,
                "date": day
            }
            cures.push(cure);
        }
    }

    let res = {
        "cases": cases,
        "deaths": deaths,
        "cures": cures,
    }
    return res;
}

// Calculate difference between value of two consecutive days

function pretty(cases) {
    let
        by = (list, k) => {
            const groups = list.reduce((groups, item) => {
                const group = (groups[item[k]] || []);
                group.push(item);
                groups[item[k]] = group;
                return groups;
            }, {});
            return groups;
        },
        g = {
            d: {
                i: by(cases, 'Reg. Date'),
                k: Object.keys(by(cases, 'Reg. Date'))
            }
        },
        Summary = (items) => {
            let summary = {
                "total": 0,
                "confirmedCasesSudanese": 0,
                "confirmedCasesForeign": 0,
                "discharged": 0,
                "deaths": 0,
                "confirmedButLocationUnidentified": 0
            };
            items.forEach(item => {
                if (item['Case Type'] === 'Confirmed') {
                    if (item['Sudanese'] === 'TRUE') {
                        summary.confirmedCasesSudanese++;
                    } else {
                        summary.confirmedCasesForeign++;
                    }
                } else if (item['Case Type'] === 'Recovered') {
                    summary.discharged++;
                } else if (item['Case Type'] === 'Dead') {
                    summary.deaths++;
                }

            });
            summary.total = summary.confirmedCasesSudanese + summary.confirmedCasesForeign;
            return summary;
        },
        Regional = (items) => {
            let
                r = {
                    i: by(items, 'State'),
                    k: Object.keys(by(items, 'State'))
                },
                regional = [];

            for (let state of r.k) {
                let v = Summary(items);
                v.count = v.total;
                delete v.total;
                v.loc = state;
                regional.push(v)
            }
            return regional;
        },
        Results = {
            success: true,
            data: []
        };
    if (!Array.isArray(cases))
        return Results;
    for (let date of g.d.k) {
        let
            items = g.d.i[date];
        Results.data.push({
            day: date,
            summary: Summary(items),
            regional: Regional(items)
        })
    }
    return Results;
}
