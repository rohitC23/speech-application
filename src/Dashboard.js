import React, { useState, useEffect } from 'react';
import {Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import moment from 'moment';
import Header from './Header';

const Dashboard = () => {
  const [scores, setScores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const userName = localStorage.getItem('user_id');
  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://communication.theknowhub.com/api/user/get/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userName }),
      });

      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setScores(data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userName) fetchScores();
  }, [userName]);

  const dates = [...new Set(scores.map((item) => item.date))];
  const levels = [...new Set(scores.map((item) => item.level))].sort((a, b) => {
    // Extract the numeric part of the level and compare
    const numA = parseInt(String(a).replace('Level ', ''), 10);
    const numB = parseInt(String(b).replace('Level ', ''), 10);
    return numA - numB;
  });

  const fixedColors = ["#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300"];

  const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a));

  const latestDates = sortedDates.slice(0, 7);

  // Prepare the Score Improvement chart
  const lineChartData = {
    labels: latestDates.map((date) => moment(date).format('DD MMM')),
    datasets: levels.map((level, index) => {
      const dataForLevel = latestDates.map((date) => {
        const scoreForDateAndLevel = scores.find(
          (item) => item.level === level && item.date === date
        );
        return scoreForDateAndLevel ? scoreForDateAndLevel.score : null;
      });

      return {
        label: `Level ${level}`,
        data: dataForLevel,
        borderColor: fixedColors[index % fixedColors.length],
        backgroundColor: 'rgba(0, 0, 0, 0)',
      };
    }),
  };

  // Prepare data for the chart
  const groupedData = latestDates.map((date) => {
    return levels.map((level) => {
      const scoresForDateLevel = scores.filter(
        (item) => item.date === date && item.level === level
      );
      return {
        date,
        level,
        attempt: scoresForDateLevel.length > 0 ? scoresForDateLevel[0].attempt : 0,
      };
    });
  });

  const barChartData = {
    labels: latestDates.map((date) => moment(date).format('DD MMM')),
    datasets: levels.map((level, index) => ({
      label: `Level ${level}`,
      data: groupedData.map((group) => {
        const levelData = group.find((item) => item.level === level);
        return levelData ? levelData.attempt : 0;
      }),
      backgroundColor: fixedColors[index % fixedColors.length],
      borderWidth: 1,
    })),
  };

  const maxAttempt = Math.max(...scores.map((item) => item.attempt));

  // Calculate KPI metrics
  const latestDate = Math.max(...scores.map((item) => new Date(item.date)));
  const latestDateData = scores.filter(
    (item) => new Date(item.date).getTime() === latestDate
  );

  // Convert duration to minutes
  const convertDurationToMinutes = (duration) => {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

    // Group data by levels
    const levelData = levels
    .map((level) => {
      const levelData = scores.filter((item) => item.level === level);
      return {
        level: parseInt(String(level).replace('Level ', ''), 10), // Ensure level is treated as a string
        totalDuration: levelData.reduce(
          (sum, item) => sum + convertDurationToMinutes(item.duration),
          0
        ),
      };
    })
    .sort((a, b) => a.level - b.level); // Sort levels in ascending order
  
  
    // Stacked Area Chart Data
    const areaChartData = {
      labels: levelData.map((item) => `Level ${item.level}`),
      datasets: [
        {
          label: 'Total Duration (Minutes)',
          data: levelData.map((item) => item.totalDuration),
          backgroundColor: 'rgba(133, 217, 255)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: true,
        },
      ],
    };

  const totalLevelsAttempted = [...new Set(latestDateData.map((item) => item.level))].length;
  const totalTimeSpent = latestDateData
    .map((item) => convertDurationToMinutes(item.duration))
    .reduce((sum, time) => sum + time, 0);

  const avgScore =
  latestDateData.reduce((sum, item) => sum + Number(item.score || 0), 0) /
  (latestDateData.length || 1);

  const mostAttemptedLevelData = latestDateData.reduce(
    (acc, curr) => (curr.attempt > acc.attempt ? curr : acc),
    { level: '', attempt: 0 }
  );
  const mostAttemptedLevel =
    mostAttemptedLevelData.attempt > 1 ? mostAttemptedLevelData.level : '--';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4 pt-20">
      <Header showNav={true} />
      <div className="max-w-5xl mx-auto">

        {loading && <p className="text-center text-xl">Loading...</p>}
        {error && <p className="text-center text-xl text-red-500">{error}</p>}

        {!loading && !error && scores.length > 0 && (
          <div>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-10">
              <div className="bg-white p-4 shadow rounded text-center">
                <h3 className="text-lg font-semibold">Total Levels Attempted</h3>
                <p className="text-2xl font-bold">{totalLevelsAttempted}</p>
              </div>
              <div className="bg-white p-4 shadow rounded text-center">
                <h3 className="text-lg font-semibold">Total Time Spent</h3>
                <p className="text-2xl font-bold">{totalTimeSpent.toFixed(2)} mins</p>
              </div>
              <div className="bg-white p-4 shadow rounded text-center">
                <h3 className="text-lg font-semibold">Average Score</h3>
                <p className="text-2xl font-bold">{avgScore.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 shadow rounded text-center">
                <h3 className="text-lg font-semibold">Most Attempted Level</h3>
                <p className="text-2xl font-bold">{mostAttemptedLevel}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Score Improvement by Level</h2>
                <Line
                  data={lineChartData}
                  options={{
                    plugins: {
                      legend: {
                        position: 'top',
                        onClick: (e, legendItem, legend) => {
                          const ci = legend.chart;
                          const index = legendItem.datasetIndex;
                          const meta = ci.getDatasetMeta(index);

                          // Check if all other datasets are already hidden
                          const allHidden = ci.data.datasets.every((dataset, i) => 
                            i === index || ci.getDatasetMeta(i).hidden
                          );

                          if (meta.hidden || allHidden) {
                            // If the selected dataset is hidden or all others are hidden, reset all visibility
                            ci.data.datasets.forEach((_, i) => {
                              ci.getDatasetMeta(i).hidden = false; // Show all datasets
                            });
                          } else {
                            // Hide all datasets except the selected one
                            ci.data.datasets.forEach((_, i) => {
                              ci.getDatasetMeta(i).hidden = i !== index;
                            });
                          }

                          // Update the chart to reflect the changes
                          ci.update();
                        },
                      },
                    },
                    responsive: true,
                    scales: {
                      x: {
                        title: {
                          display: true,
                        },
                      },
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Score',
                        },
                      },
                    },
                  }}
                />;

              </div>

              {/* Chart */}
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Attempts by Level and Date</h2>
                <Bar
                  data={barChartData}
                  options={{
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    responsive: true,
                    scales: {
                      x: {
                        stacked: false,
                        title: {
                          display: true,
                        },
                      },
                      y: {
                        stacked: false,
                        beginAtZero: true,
                        suggestedMax: maxAttempt + 1,
                        title: {
                          display: true,
                          text: 'Number of attempts',
                        },
                      },
                    },
                  }}
                />
              </div>

            </div>
            <div className="p-4 bg-white rounded shadow mt-6">
              <h2 className="text-xl font-semibold mb-2">Duration by Levels</h2>
              <Line
                data={areaChartData}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  responsive: true,
                  scales: {
                    x: {
                      title: {
                        display: true,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Total Duration (Minutes)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
