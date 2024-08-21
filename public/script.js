document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('expenseForm');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Gather form data
        const formData = new FormData(form);

        // Convert form data to JSON
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Send data to the server via POST request
        fetch('http://localhost:3000/add-expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.text())
        .then(result => {
            if (result === 'Expense successfully added!') {
                // Display success message
                successMessage.style.display = 'block';

                // Hide success message after 3 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);

                // Clear the form
                form.reset();
            } else {
                // Handle error (you can display an error message here)
                alert('There was an error adding the expense.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Optional: Add functionality to download the expenses as a CSV file
    document.getElementById('downloadCsv').addEventListener('click', function () {
        fetch('/download-expenses')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'expenses.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(error => console.error('Error:', error));
    });
});
