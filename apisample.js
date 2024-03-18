
// HTMLから要素を取得
const nearest = document.getElementById('nearest');
const distance = document.getElementById('distance');
const audio = new Audio('tohoku.mp3');
const btn = document.getElementById("btn");
// 前駅の名前を格納する変数
let previousStation;
let next;
let prev;

// 位置情報の監視IDを格納する変数
let watchId = 0;

// ボタンのクリックイベントを設定
btn.addEventListener('click', () => {
    if (watchId == 0) {
        // 位置情報の監視を開始
        watchId = navigator.geolocation.watchPosition(successCallback, errorCallback);
        btn.textContent = '停止';
    } else {
        // 位置情報の監視を停止
        navigator.geolocation.clearWatch(watchId);
        watchId = 0;
        btn.textContent = '再開';
    } 
});

// 駅名を読み上げる関数
function speakStationName(stationName, next, prev, previousStation) {
    let isTerminal = false;
    let nextStation;
    if (!previousStation && next) {
        nextStation = next;
    }else if(!previousStation && !next) {
        nextStation = prev;
    }else if(previousStation && next && next!=previousStation) {
        nextStation = next;
    }else if (previousStation && next && next==previousStation && prev) {
        nextStation = prev;
    }else if(previousStation && !next && prev!=previousStation) {
        nextStation = prev;
    }else if (previousStation && !next && prev==previousStation) {
        isTerminal = true;
    }else if (previousStation && !prev && next!=previousStation) {
        nextStation = next;
    }else if (previousStation && !prev && next==previousStation) {
        isTerminal = true;
    }else {
        nextStation = next;
    }

    let readTextURL = `https://yomi-tan.jp/api/yomi.php?ic=UTF-8&oc=UTF-8&k=h&n=3&t=${stationName}駅,${nextStation}駅`;
    fetch(readTextURL)
        .then(response => response.text())
        .then(data => {
            let readArray = data.split(',');
            let readText = readArray[0].slice(0,-2);
            let nextStationText = readArray[1].slice(0,-2);

            if ('speechSynthesis' in window) {
                const uttr = new SpeechSynthesisUtterance();
                if (isTerminal) {
                    uttr.text = `まもなく、 ${readText}、終点です。`
                }else {
                    uttr.text = `まもなく、 ${readText}です。  ${readText}の次は、${nextStationText}に停まります。`;
                }
                uttr.lang = "ja-JP";
                uttr.rate = 0.7;
                uttr.pitch = 1;
                uttr.volume = 3;

                const voices = window.speechSynthesis.getVoices();

                if (voices.length > 0) {
                    const microsoftVoice = voices.find(voice => voice.name === "Microsoft Ichiro - Japanese (Japan)");
                    if (microsoftVoice) {
                        uttr.voice = microsoftVoice;
                    }
                }

                window.speechSynthesis.speak(uttr);
            }
        });
}

// 駅名を更新して読み上げる関数
function updateStationAndSpeak(stationName, next, prev, previousStation) {
    const form = document.getElementById('form');
    if (form.value != stationName) {
        form.value = stationName;
        audio.play();

        audio.onended = () => {
            setTimeout(() => {
                speakStationName(stationName, next, prev, previousStation);
                previousStation = stationName;
            }, 1000);
        };
    }
}



// 位置情報取得成功時の処理
function successCallback(position) {
    var latitude = position.coords.latitude;
    document.getElementById("latitude").innerHTML = latitude;
    var longitude = position.coords.longitude;
    document.getElementById("longitude").innerHTML = longitude;
    let url = `https://express.heartrails.com/api/json?method=getStations&x=${longitude}&y=${latitude}`;
    // 最寄り駅情報を取得
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            nearest.innerHTML = data.response.station[0].name;
            distance.innerHTML = data.response.station[0].distance;
            next = data.response.station[0].next;
            prev = data.response.station[0].prev;
            const selectedDistance = document.getElementById('selected_distance');

            if (parseInt(data.response.station[0].distance) <= selectedDistance.value) {
                updateStationAndSpeak(data.response.station[0].name, next, prev);
            }
        });
}

// 位置情報取得失敗時の処理
function errorCallback(error) {
    alert("位置情報が取得できませんでした");
}
