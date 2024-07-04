export function validatePhone(phoneInput) {
    const phone = phoneInput.value.trim();

    const phoneRegex = /^\d+$/;

    if (phone.length !== 8 || !phoneRegex.test(phone)) {
        phoneInput.classList.add('error');
        phoneInput.value = '';
    } else {
        phoneInput.classList.remove('error');
    }
}

export function validateAddress(addressInput) {
    const address = addressInput.value.trim();

    if (!address || address.length < 10) {
        addressInput.classList.add('error');
        addressInput.value = '';
    } else {
        addressInput.classList.remove('error');
    }
}