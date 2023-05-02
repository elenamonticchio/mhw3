//endpoint
const amadeus_endpoint = 'https://test.api.amadeus.com/v1/shopping/activities?'
const yandex_endpoint='https://translate.yandex.net/api/v1.5/tr.json/translate?'
const QWeather_endpoint='https://devapi.qweather.com/v7/weather/7d?'
//chiavi
const yandex_key='trnsl.1.1.20230424T095649Z.34cfccf4e38befaf.237894ccedab4dffe96c5894d17f3bccb691a2d0'
const QWeather_key='95b055336dd84850a245da631bf85c59';

//quando viene premuto il tasto indietro si torna alla schermata principale
function onClick(event){
    window.scrollTo(0, 0);
    
    const results=document.querySelector('#results-view');
    results.classList.add('hidden');

    const container=document.querySelector('#container');
    container.innerHTML='';

    const weather=document.querySelector('#weather');
    weather.innerHTML='';

    const contents=document.querySelector('#content');
    if(contents.classList.contains('hidden')){
        contents.classList.remove('hidden');

        const title=document.querySelector('header h1');
        title.textContent='Wanderlust Adventures';
    
        const subtitle=document.querySelector('#subtitle');
        subtitle.classList.remove('hidden');
    }
}

//riceve la risposta e ritorna il file json
function onResponse(response){
    console.log('ricevuta');
    return response.json();
}

/*estrae le foto e i nomi delle attività dal file json e viene eseguita una fetch per tradurre
i nomi dall'inglese all'italiano*/
async function onAmadeusJson(json){
    console.log(json);

    const list=document.querySelector('#results-view');
    list.classList.remove('hidden');

    const container = document.querySelector('#container');
    const info = document.querySelector('#back');

    const results=json.data;

    let max;

    if(results.length===0){
        container.textContent='Nessun Risultato';
    }

    if(results.length>=6) max=6;
    else max=results.length;

    for(let i=0;i<max;i++){
        const activity = results[i];
        const name = activity.name;

        yandex_request= yandex_endpoint + 'key=' + yandex_key + '&text=' + name + '&lang=en-it';
        const yandex_response = await fetch(yandex_request);
        const yandex_json= await onResponse(yandex_response);
        const translated=yandex_json.text;

        const photo = activity.pictures[0];
        
        const amount = activity.price.amount;

        if(photo!== undefined){
            const div = document.createElement('div');
            div.classList.add('activity');

            const picture = document.createElement('img');
            picture.src= photo;
            
            const title = document.createElement('h1');
            title.textContent=translated;

            const price = document.createElement('div');
            price.textContent='Prezzo: ' + amount + ' €';
            price.classList.add('info');

            back.textContent='Torna indietro';
            back.addEventListener('click',onClick)

            div.appendChild(title);
            div.appendChild(price);
            div.appendChild(picture);
            container.appendChild(div);
        }
    }
}

//estrae le previsioni meteo per i prossimi 7 giorni dal file json
function onWeatherJson(json){
    console.log(json);

    const container=document.querySelector('#weather');
    
    const days=json.daily;
    
    if(days.length===0){
        container.textContent='Previsioni meteo non disponibili'
    }

    for(const day of days){
        const card=document.createElement("div");
        card.classList.add('card');

        const date=document.createElement('span');
        date.textContent=day.fxDate.slice(5);

        const icon=document.createElement('img');
        icon.src='./icons/' + day.iconDay + '.svg';
        icon.setAttribute('fill','red');
        icon.classList.add('icon');

        const temps=document.createElement('div');

        const text=document.createElement('span');
        text.textContent=day.textDay;
        text.classList.add('desc');

        const max=document.createElement('span');
        max.textContent=day.tempMax + '° ';

        const min=document.createElement('span');
        min.textContent=day.tempMin + '°';

        card.appendChild(date);
        card.appendChild(icon);
        card.appendChild(text);
        temps.appendChild(max);
        temps.appendChild(min);
        card.appendChild(temps);
        container.appendChild(card);
    }
}

/*dopo aver premuto sul tasto scopri di più viene eseguita una fetch che ritorna
le attività da svolgere in un determinato luogo indicato dalle coordinate geografiche.
viene anche eseguita uan fetch che richiede le previsioni meteo per i prossimi 7 giorni per la località data*/
function search(event){
    const place = event.currentTarget;

    const title=document.querySelector('header h1');
    title.textContent='Ecco le avventure consigliate: ';

    const subtitle=document.querySelector('#subtitle');
    subtitle.classList.add('hidden');

    const contents = document.querySelector('#content');
    contents.classList.add('hidden');

    const latitude = place.dataset.latitude;
    const longitude = place.dataset.longitude;
    const id=place.dataset.id;

    amadeus_request= amadeus_endpoint + 'latitude=' + latitude + '&longitude=' + longitude + '&radius=20';
    console.log(amadeus_request);
    fetch(amadeus_request,{
        headers:{
            'Authorization': 'Bearer ' + token,
        }
    }).then(onResponse).then(onAmadeusJson);

    QWeather_request=QWeather_endpoint + 'location=' + id + '&key=' + QWeather_key + '&lang=it';
    fetch(QWeather_request).then(onResponse).then(onWeatherJson);
}

//estraggo il token dal file json ricevuto
function getToken(json){
    console.log(json);
    token=json.access_token;
}

//riceve la risposta dalla fetch per richiedere il token
function onResponseToken(response){
    return response.json();
}

//MAIN

//richiedo il token per l'api Amadeus
let token;
fetch('https://test.api.amadeus.com/v1/security/oauth2/token',
{
    method: 'post',
    body: 'grant_type=client_credentials&client_id=hFFUGezoJX81L00xegODKCIRJ1CsOCAj&client_secret=tvYszuEeI2feQ6F1',
    headers:
    {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
}).then(onResponseToken).then(getToken);

//aggiungo l'event listener ai tasti 'scopri di più'
const buttons = document.querySelectorAll('#discover');
for(const button of buttons){
    button.addEventListener('click',search);
}

