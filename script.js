
function getOrCreateUserId() {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('user_id', userId);
    }
    return userId;
}

const USER_ID = getOrCreateUserId();
const API_BASE_URL = 'http://127.0.0.1:5000'; 


async function sendEvent(eventType, eventData = {}) {
    const payload = {
        user_id: USER_ID,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/track_event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error sending event: ${response.status} - ${errorText}`);
        } else {
            // console.log(`Event '${eventType}' sent successfully.`);
        }
    } catch (error) {
        console.error('Network error while sending event:', error);
    }
}


document.getElementById('myButton').addEventListener('click', (event) => {
    sendEvent('click', {
        element_id: 'myButton',
        x: event.clientX,
        y: event.clientY
    });
});


let scrollTimeout;
document.querySelector('.scroll-area').addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const element = document.querySelector('.scroll-area');
        const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
        sendEvent('scroll', {
            scroll_position: element.scrollTop,
            scroll_percentage: scrollPercentage.toFixed(2)
        });
    }, 200);
});


let pageLoadTime = Date.now();
window.addEventListener('beforeunload', () => {
    const duration = Date.now() - pageLoadTime;
    sendEvent('page_view_duration', {
        duration_ms: duration,
        duration_seconds: (duration / 1000).toFixed(2)
    });
});


document.addEventListener('DOMContentLoaded', () => {
    sendEvent('page_view', { url: window.location.href });
});



// Inisialisasi Chart.js
const ctx = document.getElementById('behaviorChart').getContext('2d');
let behaviorChart;

async function fetchAndVisualizeTrends() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_event_counts`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched event counts:", data);

        const eventTypes = data.map(item => item.event_type);
        const eventCounts = data.map(item => item.count);

        if (behaviorChart) {
            behaviorChart.destroy(); 
        }

        behaviorChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: eventTypes,
                datasets: [{
                    label: 'Jumlah Event per Tipe',
                    data: eventCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Jumlah Event'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tipe Event'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribusi Event Pengguna'
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching and visualizing trends:', error);
    }
}

document.getElementById('runAnalysisButton').addEventListener('click', async () => {
    const analysisResultDiv = document.getElementById('analysisResult');
    analysisResultDiv.innerHTML = '<p>Menjalankan analisis clustering... Mohon tunggu.</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/run_clustering`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Clustering result:", data);

        let resultHtml = '<h3>Hasil Segmentasi Pengguna (KMeans)</h3>';
        if (data.clusters && Object.keys(data.clusters).length > 0) {
            resultHtml += '<p>Total pengguna unik dianalisis: ' + data.total_users_analyzed + '</p>';
            resultHtml += '<p>Jumlah Kluster: ' + data.num_clusters + '</p>';
            for (const clusterId in data.clusters) {
                resultHtml += `<h4>Kluster ${clusterId} (Anggota: ${data.clusters[clusterId].users.length} pengguna)</h4>`;
                resultHtml += '<p><strong>Ciri-ciri Kluster (Rata-rata):</strong></p>';
                resultHtml += '<ul>';
                for (const feature in data.clusters[clusterId].average_features) {
                    resultHtml += `<li>${feature}: ${data.clusters[clusterId].average_features[feature].toFixed(2)}</li>`;
                }
                resultHtml += '</ul>';
               
            }
        } else {
            resultHtml += '<p>Tidak ada data yang cukup untuk menjalankan clustering atau terjadi kesalahan.</p>';
        }
        analysisResultDiv.innerHTML = resultHtml;

    } catch (error) {
        console.error('Error running clustering analysis:', error);
        analysisResultDiv.innerHTML = '<p style="color: red;">Gagal menjalankan analisis clustering. Silakan periksa konsol untuk detail.</p>';
    }
});



document.addEventListener('DOMContentLoaded', fetchAndVisualizeTrends);