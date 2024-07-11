$(document).ready(function() {
    let customers = [];
    let transactions = [];
    let selectedCustomer = null;

    // Fetch data from the API
    const fetchData = async () => {
        try {
            const customersResponse = await $.get('http://localhost:8000/customers');
            const transactionsResponse = await $.get('http://localhost:8000/transactions');
            customers = customersResponse;
            transactions = transactionsResponse;

            // Debugging logs
            console.log('Customers:', customers);
            console.log('Transactions:', transactions);

            renderTable(customers, transactions);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    // Render the customer table
    const renderTable = (customers, transactions) => {
        const $tbody = $('#customer-table tbody');
        $tbody.empty();

        customers.forEach(customer => {
            // Filter transactions for the current customer
            const customerTransactions = transactions.filter(transaction => {
                return String(transaction.customer_id) === String(customer.id); // Ensure both IDs are strings for comparison
            });

            // Debugging log: Check filtered transactions
            console.log(`Customer ID: ${customer.id}`);
            console.log('Customer Transactions:', customerTransactions); // Log filtered transactions

            // Calculate total amount
            const totalAmount = customerTransactions.reduce((sum, transaction) => {
                return sum + parseFloat(transaction.amount);
            }, 0);

            // Debugging log: Check totalAmount
            console.log(`Customer: ${customer.name}, Total Amount: ${totalAmount}`);

            // Find the last transaction date
            const lastTransactionDate = customerTransactions.length ? customerTransactions[customerTransactions.length - 1].date : 'No Transactions';

            // Create a new table row
            const $row = $('<tr>').attr('data-customer-id', customer.id);
            const $nameCell = $('<td>').text(customer.name);
            const $dateCell = $('<td>').text(lastTransactionDate);
            const $amountCell = $('<td>').text(totalAmount.toFixed(2));

            // Append cells to row
            $row.append($nameCell, $dateCell, $amountCell);

            // Append row to tbody
            $tbody.append($row);
        });

        // Add click event listener to each row
        $tbody.find('tr').on('click', function() {
            const customerId = $(this).data('customer-id');
            selectedCustomer = customers.find(customer => customer.id === customerId);
            renderChart(selectedCustomer.id);
        });
    };

    // Render the transaction chart
    const renderChart = (customerId) => {
        const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
        const dates = customerTransactions.map(transaction => transaction.date);
        const amounts = customerTransactions.map(transaction => transaction.amount);

        const ctx = $('#transaction-chart');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Transaction Amount',
                    data: amounts,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)'
                }]
            }
        });
    };

    // Filter the table
    $('#filter-input').on('keyup', function() {
        const filter = $(this).val().toLowerCase();
        const filteredCustomers = customers.filter(customer => customer.name.toLowerCase().includes(filter));
        renderTable(filteredCustomers, transactions);
    });

    

    // Initial data fetch
    fetchData();
});
