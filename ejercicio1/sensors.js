class Sensor {
    constructor(id, name, type, value, unit, updatedAt) {
        this.id = id;
        this.name = name;
        this._type = type;
        this.value = value;
        this.unit = unit;
        this._updatedAt = updatedAt;
    }

    get type() {
        return this._type;
    }

    set type(newType) {
        const validTypes = ['temperature', 'humidity', 'pressure'];
        if (!validTypes.includes(newType)) {
            throw new Error(`Invalid sensor type: ${newType}. Valid types are: ${validTypes.join(', ')}`);
        }
        this._type = newType;
    }

    updateValue(newValue) {
        this.value = newValue;
        this._updatedAt = new Date().toISOString();
    }
}

class SensorManager {
    constructor() {
        this.sensors = [];
    }

    addSensor(sensor) {
        this.sensors.push(sensor);
    }

    updateSensorById(sensorId) {
        const sensor = this.sensors.find(sensor => sensor.id === sensorId);
        if (sensor) {
            let newValue;
            switch (sensor.type) {
                case "temperature":
                    newValue = (Math.random() * 80 - 30).toFixed(2);
                    break;
                case "humidity":
                    newValue = (Math.random() * 100).toFixed(2);
                    break;
                case "pressure":
                    newValue = (Math.random() * 80 + 960).toFixed(2);
                    break;
                default:
                    newValue = (Math.random() * 100).toFixed(2);
            }
            sensor.updateValue(newValue);
            this.render();
        } else {
            console.error(`Sensor ID ${sensorId} not found.`);
        }
    }

    loadSensorsFromUrl(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error loading sensors.json");
                }
                return response.json();
            })
            .then(data => {
                data.forEach(sensorData => {
                    const sensor = new Sensor(sensorData.id, sensorData.name, sensorData.type, sensorData.value, sensorData.unit, sensorData.updatedAt);
                    this.addSensor(sensor);
                });
                this.render();
            })
            .catch(error => {
                console.error(error);
            });
    }

    renderSensors() {
        const container = document.getElementById("sensor-container");
        container.innerHTML = "";
        this.sensors.forEach(sensor => {
            const sensorCard = document.createElement("div");
            sensorCard.className = "column is-one-third";
            sensorCard.innerHTML = `
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">Sensor ID: ${sensor.id}</p>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <p><strong>Type:</strong> ${sensor.type}</p>
                            <p><strong>Value:</strong> ${sensor.value} ${sensor.unit}</p>
                        </div>
                        <time datetime="${sensor._updatedAt}">Last Updated: ${new Date(sensor._updatedAt).toLocaleString()}</time>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item update-button" data-id="${sensor.id}">Update</a>
                    </footer>
                </div>
            `;
            container.appendChild(sensorCard);
        });

        const updateButtons = document.querySelectorAll(".update-button");
        updateButtons.forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                const sensorId = parseInt(button.getAttribute("data-id"));
                this.updateSensorById(sensorId);
            });
        });
    }
}

const sensorManager = new SensorManager();
sensorManager.loadSensorsFromUrl("sensors.json");

