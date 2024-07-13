$(document).ready(function() {
    // Initialize empty arrays to store customers and transactions data
    let customers = [];
    let transactions = [];
    let selectedCustomer = null;  // Variable to hold the selected customer

    // Function to fetch data from the API
    const fetchData = async () => {
        try {
            // Fetch customers and transactions data from the API
            const customersResponse = await $.get('https://cosmasalor.github.io/Task/db.json');
            const transactionsResponse = await $.get('http://localhost:8000/transactions');
            customers = customersResponse;  // Assign fetched customers data to the customers array
            transactions = transactionsResponse;  // Assign fetched transactions data to the transactions array

            // Debugging logs to check the fetched data
            console.log('Customers:', customers);
            console.log('Transactions:', transactions);

            // Call the function to render the customer table
            renderTable(customers, transactions);
        } catch (error) {
            // Log any errors that occur during data fetching
            console.error('Error fetching data', error);
        }
    };

    // Function to render the customer table
    const renderTable = (customers, transactions) => {
        const $tbody = $('#customer-table tbody');  // Select the table body element
        $tbody.empty();  // Clear any existing rows in the table body

        customers.forEach(customer => {
            // Filter transactions for the current customer
            const customerTransactions = transactions.filter(transaction => {
                return String(transaction.customer_id) === String(customer.id);  // Ensure both IDs are strings for comparison
            });

            // Debugging log: Check filtered transactions
            console.log(`Customer ID: ${customer.id}`);
            console.log('Customer Transactions:', customerTransactions);  // Log filtered transactions

            // Calculate the total amount for the customer's transactions
            const totalAmount = customerTransactions.reduce((sum, transaction) => {
                return sum + parseFloat(transaction.amount);  // Sum up the amounts
            }, 0);

            // Debugging log: Check total amount
            console.log(`Customer: ${customer.name}, Total Amount: ${totalAmount}`);

            // Find the date of the last transaction
            const lastTransactionDate = customerTransactions.length ? customerTransactions[customerTransactions.length - 1].date : 'No Transactions';

            // Create a new table row
            const $row = $('<tr>').attr('data-customer-id', customer.id);  // Set a data attribute with the customer ID
            const $nameCell = $('<td>').text(customer.name);  // Create a cell for the customer's name
            const $dateCell = $('<td>').text(lastTransactionDate);  // Create a cell for the last transaction date
            const $amountCell = $('<td>').text(totalAmount.toFixed(2));  // Create a cell for the total amount

            // Append cells to the row
            $row.append($nameCell, $dateCell, $amountCell);

            // Append the row to the table body
            $tbody.append($row);
        });

        // Add click event listener to each row
        $tbody.find('tr').on('click', function() {
            const customerId = $(this).data('customer-id');  // Get the customer ID from the clicked row
            selectedCustomer = customers.find(customer => customer.id === customerId);  // Find the selected customer in the customers array
            renderChart(selectedCustomer.id);  // Call the function to render the transaction chart for the selected customer
        });
    };

    // Function to render the transaction chart
    const renderChart = (customerId) => {
        // Filter transactions for the selected customer
        const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
        const dates = customerTransactions.map(transaction => transaction.date);  // Get the transaction dates
        const amounts = customerTransactions.map(transaction => transaction.amount);  // Get the transaction amounts

        const ctx = $('#transaction-chart');  // Select the chart element
        new Chart(ctx, {
            type: 'line',  // Set the chart type to line
            data: {
                labels: dates,  // Set the labels to the transaction dates
                datasets: [{
                    label: 'Transaction Amount',
                    data: amounts,  // Set the data to the transaction amounts
                    borderColor: 'rgba(75, 192, 192, 1)',  // Set the line color
                    backgroundColor: 'rgba(75, 192, 192, 0.2)'  // Set the background color
                }]
            }
        });
    };

    // Event listener to filter the customer table based on input
    $('#filter-input').on('keyup', function() {
        const filter = $(this).val().toLowerCase();  // Get the input value and convert it to lowercase
        const filteredCustomers = customers.filter(customer => customer.name.toLowerCase().includes(filter));  // Filter customers based on the input
        renderTable(filteredCustomers, transactions);  // Call the function to render the table with the filtered customers
    });

    // Initial data fetch
    fetchData();  // Call the function to fetch data when the document is ready
});
