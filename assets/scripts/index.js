document.getElementById('hamburger-menu').addEventListener('click', function() {
            var navLinks = document.getElementById('nav-links');
            navLinks.classList.toggle('active');
        });

        let borderSize = 2; 
        const maxBorderSize = 3; 
        const borderIncrement = 1; 
        const whatsappIcon = document.getElementById('wa-icon');
        
        setInterval(() => {
            borderSize += borderIncrement;
            if (borderSize > maxBorderSize) {
                borderSize = 2; 
            }
            whatsappIcon.style.borderWidth = `${borderSize}px`;
        }, 500);


        const text = "APOCARS"; // The text to be typed
        const displayElement = document.getElementById('brand-name');
        let index = 0;
        const typingSpeed = 500; 
        const delayBetweenRetypes = 6000; 
        
        function typeText() {
            if (index < text.length) {
                displayElement.innerHTML += text.charAt(index);
                index++;
                setTimeout(typeText, typingSpeed);
            } else {
                setTimeout(() => {
                    displayElement.innerHTML = ""; 
                    index = 0; 
                    typeText(); 
                }, delayBetweenRetypes); 
            }
        }
        
        typeText(); // Start the typing animation

// Select the header element
const header = document.getElementById('header');

// Function to change the header background on scroll
window.onscroll = function () {
    if (window.scrollY > 100) {  // If the scroll is more than 100px
        header.classList.add('scrolled');  // Add the 'scrolled' class
    } else {
        header.classList.remove('scrolled');  // Remove the 'scrolled' class if scroll is less than 100px
    }
};