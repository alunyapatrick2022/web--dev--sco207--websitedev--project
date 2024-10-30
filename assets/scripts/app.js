document.getElementById('contactForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const message = event.target.message.value;

    try {
        const response = await fetch('http://localhost:3000/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, message })
        });

        const result = await response.json();
        alert(result.message);

    } catch (error) {
        alert("Failed to send message.");
        console.error("Error:", error);
    }
});