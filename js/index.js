var HUD = new Vue({
    el: ".hud_wrapper",
    data: {
        show: false,
		bonusblock: false,
		lastbonus: "2ч. 26м",
        ammo: 0,
        money: "117 000 000",
        bank: "17 121 212",
        mic: false,
        time: "02:01",
        date: "22.04.2021",
        street: "Гора Чиллиад",
        crossingRoad: "Шоссе Сенора",
        server: 1,
        playerId : 0,
		personId: 0,
        online: 0,
        inVeh: true,
        logotype: false,
		belt: false,
        engine: false,
        doors: false,
        speed: "300",
        fuel: 0,
        help: 
        [
            {key: "G", desc: "Взимодействие"},
            {key: "I", desc: "Инвентарь"},
            {key: "N", desc: "Голосовой чат"},
            {key: "L", desc: "Замок Т/С"},
            {key: "F3", desc: "Перезапустить войс"},
            {key: "F6", desc: "Скрыть подсказки"},
            {key: "`", desc: "Курсор"},
        ],
    },
    methods: {
        setTime: (time, date) => {
            this.time = time;
            this.date = date;
        }, 
		showBonus(){
			this.bonusblock = !this.bonusblock;
		},
    }
})

if(window.location.hash && window.location.hash.indexOf('test') >= -1) {
    $(document).ready(() => {
        document.querySelector('.safezone').style.background = 'rgba(0,0,0,.25)';
        hidehud(false);
        chatAPI.push('development mode');
    });
}