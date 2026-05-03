document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Logic ---
    const modal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-modal');
    const orderForm = document.getElementById('orderForm');
    const selectedProductText = document.getElementById('selectedProductText');
    const orderSummaryText = document.getElementById('orderSummaryText');

    const openModal = () => {
        if (modal) modal.style.display = 'flex';
    };

    const closeModal = () => {
        if (modal) modal.style.display = 'none';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Decants Page Logic ---
    let selectedDecants = [];
    const decantAddBtns = document.querySelectorAll('.decant-add-btn');
    const commanderDecantsBtn = document.getElementById('commanderDecantsBtn');

    const updateDecantTotal = () => {
        const priceDisplay = document.getElementById('totalPrice');
        if (!priceDisplay || !document.querySelector('.decant-add-btn')) return;

        let total = 0;
        let prices = selectedDecants.map(d => d.price).sort((a, b) => a - b);
        
        // Pricing logic: Buy 2, get 3rd free
        if (prices.length >= 3) {
            // Remove the cheapest one for every group of 3
            let freeItemsCount = Math.floor(prices.length / 3);
            for (let i = 0; i < prices.length; i++) {
                if (i < freeItemsCount) continue; // Skip the cheapest ones
                total += prices[i];
            }
        } else {
            total = prices.reduce((sum, p) => sum + p, 0);
        }

        priceDisplay.textContent = total;
    };

    decantAddBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productName = btn.getAttribute('data-product');
            const productPrice = parseInt(btn.getAttribute('data-price'));
            
            // Toggle selection
            const index = selectedDecants.findIndex(d => d.name === productName);
            if (index > -1) {
                selectedDecants.splice(index, 1);
                btn.innerText = "Ajouter";
                btn.style.backgroundColor = "";
            } else {
                selectedDecants.push({ name: productName, price: productPrice });
                btn.innerText = "Ajouté ✓";
                btn.style.backgroundColor = "var(--gold)";
            }
            updateDecantTotal();
        });
    });

    if (commanderDecantsBtn) {
        commanderDecantsBtn.addEventListener('click', () => {
            if (selectedDecants.length === 0) {
                alert("Veuillez ajouter au moins un décant au panier.");
                return;
            }

            const names = selectedDecants.map(d => d.name).join(', ');
            const priceDisplay = document.getElementById('totalPrice');
            const total = priceDisplay ? priceDisplay.textContent : '0';
            
            let promoText = "";
            if (selectedDecants.length >= 2) {
                promoText = " + 3ème Gratuit Offert !";
            }

            if (selectedProductText) {
                selectedProductText.innerText = `Décants choisis : ${names} (Total: ${total}dh)${promoText}`;
            }
            openModal();
        });
    }

    // --- Homme & Femme Pages Logic (Cart & Pricing) ---
    const checkboxes = document.querySelectorAll('.perfume-check');
    const manualInputs = document.querySelectorAll('.manual-perfume');
    const totalPriceElement = document.getElementById('totalPrice');
    const commanderBtn = document.getElementById('commanderBtn');

    const calculatePrice = (count) => {
        if (count === 0) return 0;
        if (count === 1) return 50;
        if (count === 2) return 100;
        if (count === 3) return 135;
        if (count >= 4) return 180;
        return 0;
    };

    const updateTotal = () => {
        const priceDisplay = document.getElementById('totalPrice');
        if (!priceDisplay) return;

        let selectedCount = 0;
        const allCheckboxes = document.querySelectorAll('.perfume-check');
        const allManualInputs = document.querySelectorAll('.manual-perfume');

        allCheckboxes.forEach(cb => {
            if (cb.checked) selectedCount++;
        });

        allManualInputs.forEach(input => {
            if (input.value.trim() !== '') selectedCount++;
        });

        const total = calculatePrice(selectedCount);
        priceDisplay.textContent = total;
    };

    // Initialize total on load
    updateTotal();

    if (checkboxes.length > 0) {
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                let checkedCount = Array.from(checkboxes).filter(c => c.checked).length;
                let manualCount = Array.from(manualInputs).filter(i => i.value.trim() !== '').length;
                
                if (checkedCount + manualCount > 4) {
                    cb.checked = false;
                    alert("Vous pouvez choisir jusqu'à 4 parfums maximum pour cette offre.");
                }
                updateTotal();
            });
        });
    }

    if (manualInputs.length > 0) {
        manualInputs.forEach(input => {
            input.addEventListener('input', () => {
                let checkedCount = Array.from(checkboxes).filter(c => c.checked).length;
                let manualCount = Array.from(manualInputs).filter(i => i.value.trim() !== '').length;

                if (checkedCount + manualCount > 4) {
                    input.value = '';
                    alert("Vous pouvez choisir jusqu'à 4 parfums maximum pour cette offre.");
                }
                updateTotal();
            });
        });
    }

    if (commanderBtn) {
        commanderBtn.addEventListener('click', () => {
            let selectedPerfumes = [];
            checkboxes.forEach(cb => {
                if (cb.checked) selectedPerfumes.push(cb.value);
            });
            manualInputs.forEach(input => {
                if (input.value.trim() !== '') selectedPerfumes.push(input.value.trim());
            });

            if (selectedPerfumes.length === 0) {
                alert("Veuillez choisir au moins un parfum.");
                return;
            }

            if (orderSummaryText) {
                const priceDisplay = document.getElementById('totalPrice');
                const currentTotal = priceDisplay ? priceDisplay.textContent : '0';
                orderSummaryText.innerText = `Votre sélection : ${selectedPerfumes.join(', ')} (Total: ${currentTotal}dh)`;
            }
            openModal();
        });
    }

    // --- Form Submission ---
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                prenom: document.getElementById('prenom').value,
                nom: document.getElementById('nom').value,
                ville: document.getElementById('ville').value,
                adresse: document.getElementById('adresse').value,
                telephone: document.getElementById('telephone').value,
            };

            // Get selected products and total
            let productsInfo = "";
            let totalInfo = "0";

            if (selectedProductText && selectedProductText.innerText.includes("Décants choisis :")) {
                // For decants.html
                productsInfo = selectedProductText.innerText;
            } else if (selectedProductText && selectedProductText.innerText.includes("Produit :")) {
                // Fallback for old decants logic if needed
                productsInfo = selectedProductText.innerText;
            } else if (orderSummaryText && orderSummaryText.innerText.includes("Votre sélection :")) {
                // For homme.html or femme.html
                productsInfo = orderSummaryText.innerText;
            }

            // WhatsApp Integration
            const phoneNumber = "212714844721";
            const message = `*Nouvelle Commande - Parfum Store*%0A%0A` +
                            `*Client :* ${formData.prenom} ${formData.nom}%0A` +
                            `*Ville :* ${formData.ville}%0A` +
                            `*Adresse :* ${formData.adresse}%0A` +
                            `*Téléphone :* ${formData.telephone}%0A%0A` +
                            `*Détails :*%0A${productsInfo}`;

            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            alert(`Merci ${formData.prenom} ! Votre commande a été préparée. Vous allez être redirigé vers WhatsApp pour la valider.`);
            
            orderForm.reset();
            closeModal();
            
            // Reset UI
            selectedDecants = [];
            decantAddBtns.forEach(btn => {
                btn.innerText = "Ajouter";
                btn.style.backgroundColor = "";
            });
            checkboxes.forEach(cb => cb.checked = false);
            manualInputs.forEach(input => input.value = '');
            updateTotal();
            updateDecantTotal();
        });
    }

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});
