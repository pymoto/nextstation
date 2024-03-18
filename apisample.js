
const nearest = document.getElementById('nearest');
const distance = document.getElementById('distance');
const audio = new Audio('tohoku.mp3');


    // ボタンを押した時の処理
let watchId = 0;
const btn = document.getElementById("btn")
// .onclick = function(){
btn.addEventListener('click', () => {
    if (watchId == 0) {
        watchId = navigator.geolocation.watchPosition(successCallback, errorCallback);
        btn.textContent = '停止';
    }else {
        navigator.geolocation.clearWatch(watchId);
        watchId = 0;
        btn.textContent = '再開';
    }
    
});


function speakStationName(stationName) {
    // 読みを取得
    let readTextURL = `https://yomi-tan.jp/api/yomi.php?ic=UTF-8&oc=UTF-8&k=h&n=3&t=${stationName}駅`
    fetch(readTextURL)
        .then(response => response.text())
        .then(data => {
            let readArray = data.split(',');
            let readText = readArray[0].slice(0,-2);
    // ブラウザにWeb Speech API Speech Synthesis機能があるか判定

            if ('speechSynthesis' in window) {
                const uttr = new SpeechSynthesisUtterance();
                uttr.text = `まもなく、 ${readText}です`;
                uttr.lang = "ja-JP";
                uttr.rate = 0.7;
                uttr.pitch = 1;
                uttr.volume = 3;

                // ブラウザが提供する音声を取得
                const voices = window.speechSynthesis.getVoices();

                // ブラウザの音声が取得できた場合
                if (voices.length > 0) {
                    // Microsoftの声質を探す
                    const microsoftVoice = voices.find(voice => voice.name === "Microsoft Ichiro - Japanese (Japan)");

                    // Microsoftの声質が見つかった場合
                    if (microsoftVoice) {
                        uttr.voice = microsoftVoice;
                    }
                }

                // 発言を再生
                window.speechSynthesis.speak(uttr);
            }
        })

}


const form = document.getElementById('form');

function updateStationAndSpeak(stationName) {
    if (form.value != stationName) {
        form.value = stationName;

        audio.play();

        // 音声が再生されるのを待つ
        audio.onended = () => {
            setTimeout(() => {
                speakStationName(stationName);
            }, 1000);
            
        };

    }
}





// 取得に成功した場合の処理
function successCallback(position){
    // 緯度を取得し画面に表示
    var latitude = position.coords.latitude;
    document.getElementById("latitude").innerHTML = latitude;
    // 経度を取得し画面に表示
    var longitude = position.coords.longitude;
    document.getElementById("longitude").innerHTML = longitude;
    let url = `https://express.heartrails.com/api/json?method=getStations&x=${longitude}&y=${latitude}`;

    fetch(url) //1
        .then(response => response.json()) //2
        .then(data => {  //3
            nearest.innerHTML = `
            ${data.response.station[0].name}
            `;
            console.log(data);
            distance.innerHTML = `
            ${data.response.station[0].distance}`
            // if (parseInt(data.response.station[0].distance) <= 2000) {
            //     form.value = data.response.station[0].name;
            // }
            // form.addEventListener('input', () => {
            //     const stationName = form.value;
            //     if (stationName.trim() !== '') {
            //         speakStationName(stationName);
            //     }
            // })
            if (parseInt(data.response.station[0].distance) <= 2000) {
                updateStationAndSpeak(data.response.station[0].name);
            }
        });
};

// 取得に失敗した場合の処理
function errorCallback(error){
    alert("位置情報が取得できませんでした");
};



