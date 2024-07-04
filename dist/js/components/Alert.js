
class Alert {
    constructor(message, type) {
        const thisAlert = this;

        thisAlert.message = message;
        thisAlert.type = type;

        thisAlert.showAlert();
    }

    showAlert() {
        const alert = document.createElement('div');
        alert.textContent = this.message;
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.padding = '10px';
        alert.style.zIndex = '1000';
        alert.style.color = 'white';
        alert.style.borderRadius = '5px';

        switch (this.type) {
            case 'success':
                alert.style.backgroundColor = 'green';
                break;
            case 'warning':
                alert.style.backgroundColor = 'orange';
                break;
            case 'error':
                alert.style.backgroundColor = 'red';
                break;
            default:
                alert.style.backgroundColor = 'gray';
        }

        document.body.appendChild(alert);

        setTimeout(() => {
            document.body.removeChild(alert);
        }, 1500);
    }
}

export default Alert;