
// client_packages/speedometer/index.js

let speedoBrowser = null;

mp.events.add('playerEnterVehicle', (vehicle, seat) => {
    if (seat === -1 && !speedoBrowser) {
        speedoBrowser = mp.browsers.new('package://speedometer/hud.html');
    }
});

mp.events.add('playerLeaveVehicle', (vehicle, seat) => {
    if (seat === -1 && speedoBrowser) {
        speedoBrowser.destroy();
        speedoBrowser = null;
    }
});

mp.events.add('render', () => {
    const player = mp.players.local;
    if (speedoBrowser && player.vehicle) {
        const vehicle = player.vehicle;
        const speed = Math.round(vehicle.getSpeed() * 3.6); // m/s ke km/h
        const health = vehicle.getEngineHealth();
        const fuel = vehicle.getPetrolTankHealth ? vehicle.getPetrolTankHealth() : 1000.0;

        speedoBrowser.execute(`updateSpeed(${speed}, ${fuel}, ${health});`);
    }
});
