        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('search');
            const customerTableBody = document.getElementById('customer-table').getElementsByTagName('tbody')[0];
            const chartContainer = document.getElementById('chart-container');
            const transactionChartCanvas = document.getElementById('transaction-chart');
            const apiUrl = 'http://localhost:3001';
            
            let customers = [];
            let transactions = [];
            let transactionChart;

            particlesJS.load('particles-js', 'particles.json', function() {
                console.log('particles.json loaded...');
            });

            fetch(`${apiUrl}/customers`)
                .then(response => response.json())
                .then(data => {
                    customers = data;
                    return fetch(`${apiUrl}/transactions`);
                })
                .then(response => response.json())
                .then(data => {
                    transactions = data;
                    displayData(customers, transactions);
                });

            function displayData(customers, transactions) {
                customerTableBody.innerHTML = '';

                transactions.forEach(transaction => {
                    const customer = customers.find(c => c.id === transaction.customer_id);
                    const row = document.createElement('tr');
                    row.dataset.customerId = customer ? customer.id : null;
                    row.innerHTML = `
                        <td>${customer ? customer.name : 'Unknown'}</td>
                        <td>${transaction.date}</td>
                        <td>${transaction.amount}</td>
                    `;
                    customerTableBody.appendChild(row);

                    row.addEventListener('click', () => {
                        const filteredTransactions = transactions.filter(t => t.customer_id === customer.id);
                        updateChart(filteredTransactions, customer.name);
                    });
                });
            }

            searchInput.addEventListener('input', function() {
                const filter = searchInput.value.toLowerCase();
                const filteredCustomers = customers.filter(customer => customer.name.toLowerCase().includes(filter));
                const filteredTransactions = transactions.filter(transaction => {
                    const customer = filteredCustomers.find(c => c.id === transaction.customer_id);
                    return customer || transaction.amount.toString().includes(filter);
                });

                displayData(filteredCustomers, filteredTransactions);

                if (filteredCustomers.length === 1) {
                    updateChart(filteredTransactions, filteredCustomers[0].name);
                } else {
                    updateChart(transactions, 'All Customers');
                }
            });

            function updateChart(transactions, customerName) {
                const dates = [...new Set(transactions.map(t => t.date))];
                const chartData = dates.map(date => {
                    return transactions
                        .filter(t => t.date === date)
                        .reduce((sum, t) => sum + t.amount, 0);
                });

                if (transactionChart) {
                    transactionChart.destroy();
                }

                transactionChart = new Chart(transactionChartCanvas, {
                    type: 'bar',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: `${customerName}`,
                            data: chartData,
                            backgroundColor: 'rgba(255, 255, 255)',
                            borderColor: 'rgba(255, 255, 255)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.2)'
                                },
                                ticks: {
                                    color: '#fff'
                                }
                            },
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.2)'
                                },
                                ticks: {
                                    color: '#fff'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#fff'
                                }
                            }
                        },
                        maintainAspectRatio: false
                    }
                });
            }
        });