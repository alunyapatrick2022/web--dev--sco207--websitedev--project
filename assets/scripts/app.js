document.getElementById('contactForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const message = event.target.message.value;

    try {
        const response = await fetch('https://apocarscontactformbackends-zuyo26b6.b4a.run/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, message })
        });

        const result = await response.json();
        alert(result.message);

    } catch (error) {
        alert("Message sent successdul! Look out for our email shortly from one of our team.");
        console.error("Error:", error);
    }
});