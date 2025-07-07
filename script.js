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
            // console.log(`Event '${eventType}' sent successfully.`); // Uncomment for debugging
        }
    } catch (error) {
        console.error('Network error while sending event:', error);
    }
}

// --- Event Tracking Logic (for tracking.html) ---
function setupTrackingPage() {
    console.log("Tracking page: Setting up event listeners.");
    // 1. Click Tracking
    const myButton = document.getElementById('myButton');
    if (myButton) { // Ensure element exists on this page
        myButton.addEventListener('click', (event) => {
            sendEvent('click', {
                element_id: 'myButton',
                x: event.clientX,
                y: event.clientY
            });
            console.log("Tracking page: 'Klik Saya!' button clicked.");
        });
    }

    // 2. Scroll Tracking
    const scrollArea = document.querySelector('.scroll-area');
    if (scrollArea) { // Ensure element exists on this page
        let scrollTimeout;
        scrollArea.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const element = document.querySelector('.scroll-area');
                const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
                sendEvent('scroll', {
                    scroll_position: element.scrollTop,
                    scroll_percentage: scrollPercentage.toFixed(2)
                });
                console.log(`Tracking page: Scroll event triggered, percentage: ${scrollPercentage.toFixed(2)}%`);
            }, 200); // Limit scroll event frequency
        });
    }

    // 3. Page Interaction Duration Tracking (Page View Duration)
    let pageLoadTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const duration = Date.now() - pageLoadTime;
        sendEvent('page_view_duration', {
            duration_ms: duration,
            duration_seconds: (duration / 1000).toFixed(2)
        });
        console.log(`Tracking page: Page view duration sent: ${duration / 1000} seconds.`);
    });

    // Initial page view event on DOM content loaded
    sendEvent('page_view', { url: window.location.href });
    console.log("Tracking page: Initial page_view event sent.");
}


// --- Analysis and Visualization Logic (for analysis.html) ---
let behaviorChart; // Declare globally for analysis page
let ctx; // Declare globally

async function fetchAndVisualizeTrends() {
    console.log("Analysis page: fetchAndVisualizeTrends called.");
    ctx = document.getElementById('behaviorChart').getContext('2d');
    const chartWrapper = document.getElementById('chartWrapper'); 

    // Temporarily hide the canvas and display a loading message within chartWrapper
    ctx.canvas.style.display = 'none';
    chartWrapper.innerHTML = '<p id="chartStatusMessage">Memuat data tren...</p>';
    console.log("Analysis page: Chart loading message displayed.");

    try {
        const response = await fetch(`${API_BASE_URL}/get_event_counts`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Analysis page: Fetched event counts data:", data);

        const chartStatusMessage = document.getElementById('chartStatusMessage');

        if (data.length === 0) {
            console.log("Analysis page: No event data available for trend visualization.");
            // If no data, display a message
            chartStatusMessage.textContent = 'Tidak ada data event yang tersedia untuk visualisasi tren.';
            if (behaviorChart) {
                behaviorChart.destroy(); // Ensure old chart is destroyed
            }
            ctx.canvas.style.display = 'none'; // Ensure canvas remains hidden
            return;
        }

        // If data is available, clear the status message and display the canvas
        chartWrapper.innerHTML = ''; // Clear status message from wrapper
        chartWrapper.appendChild(ctx.canvas); // Add canvas back to the wrapper
        ctx.canvas.style.display = 'block'; // Show canvas
        console.log("Analysis page: Chart canvas displayed.");

        const eventTypes = data.map(item => item.event_type);
        const eventCounts = data.map(item => item.count);

        if (behaviorChart) {
            behaviorChart.destroy(); // Destroy old chart if it exists
            console.log("Analysis page: Existing chart destroyed.");
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
        console.log("Analysis page: New chart created successfully.");

    } catch (error) {
        console.error('Analysis page: Error fetching and visualizing trends:', error);
        const chartStatusMessage = document.getElementById('chartStatusMessage');
        chartStatusMessage.textContent = 'Gagal memuat visualisasi tren. Silakan coba lagi.';
        if (behaviorChart) {
            behaviorChart.destroy(); // Ensure old chart is destroyed
        }
        ctx.canvas.style.display = 'none'; // Ensure canvas remains hidden
    }
}

function setupAnalysisPage() {
    console.log("Analysis page: Setting up analysis page functions.");
    // Button to run clustering analysis
    const runAnalysisButton = document.getElementById('runAnalysisButton');
    if (runAnalysisButton) { // Ensure element exists on this page
        runAnalysisButton.addEventListener('click', async () => {
            console.log("Analysis page: 'Jalankan Analisis Clustering' button clicked.");
            const analysisResultDiv = document.getElementById('analysisResult');
            analysisResultDiv.innerHTML = '<p>Menjalankan analisis clustering... Mohon tunggu.</p>';

            try {
                const response = await fetch(`${API_BASE_URL}/run_clustering`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                }
                const data = await response.json();
                console.log("Analysis page: Clustering result data:", data);

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
                        // resultHtml += `<p>Pengguna di kluster ini: ${data.clusters[clusterId].users.join(', ')}</p>`; // Can be displayed if desired
                    }
                    console.log("Analysis page: Clustering results rendered successfully.");
                } else {
                    resultHtml += '<p>Tidak ada data yang cukup untuk menjalankan clustering atau terjadi kesalahan. (Periksa log server untuk detail lebih lanjut).</p>';
                    console.warn("Analysis page: Clustering data is empty or invalid.", data);
                }
                analysisResultDiv.innerHTML = resultHtml;

            } catch (error) {
                console.error('Analysis page: Error running clustering analysis:', error);
                analysisResultDiv.innerHTML = '<p style="color: red;">Gagal menjalankan analisis clustering. Silakan periksa konsol browser dan log server untuk detail.</p>';
            }
        });
    }

    // Call the visualization function when the analysis page loads
    fetchAndVisualizeTrends();
}


// --- Main Entry Point: Determine which page is loaded ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    console.log("DOMContentLoaded: Current path is", path);

    if (path.includes('tracking.html')) {
        console.log("DOMContentLoaded: Loading tracking page setup...");
        setupTrackingPage();
    } else if (path.includes('analysis.html')) {
        console.log("DOMContentLoaded: Loading analysis page setup...");
        setupAnalysisPage();
    } else {
        console.log("DOMContentLoaded: Loading index page (no specific script setup needed).");
        // No specific script setup needed for index.html as it's just navigation
    }
});
