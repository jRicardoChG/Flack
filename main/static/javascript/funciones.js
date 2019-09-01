var xhr = new XMLHttpRequest();
var Dias = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var canalesGlobales = document.querySelector("#canalesGlobales").children[1];

////////////////////////////////////////////////MAIN CODE/////////////////////////////////////////////////////////////////
// Conectar con el servidor
var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);
socket.on("connect", mensaje => {
    console.log("me he conectado");
    document.querySelector("#boton2").addEventListener("click", enviardatos);
})
// Test de coenxion con el servidor
socket.on("testConexion", mensaje => {
    console.log(mensaje["conexion"]);
})
// Cuando se envia un mensaje en el chat
socket.on("mensajeServer", mensaje => {
    var recibido = mensaje["seleccion"];
    console.log(recibido);
    if (recibido == "" || recibido == null || recibido == undefined) {
        return;
    }
    else {
        let mensajeCaja = document.createElement("div");
        mensajeCaja.innerHTML = '<div class="mCom global"><p class="global"></p></div>';
        mensajeCaja.classList.add("flexMessageLeft");
        mensajeCaja.classList.add("global");
        mensajeCaja.children[0].children[0].innerHTML = recibido;
        let chat = document.querySelector("#chatscroll");
        chat.appendChild(mensajeCaja);
    }
})
// Para poder enviar datos con enter
window.addEventListener("keypress", (event) => {
    if (event.keyCode === 13 && !event.shiftKey) {
        enviardatos();
    }
});
// Para que el div de mensajes este siempre abajo y meustre todos los mensajes
window.addEventListener("DOMNodeInserted", function () {
    var scroll = document.querySelector("#chatscroll");
    scroll.scrollTop = scroll.scrollTop + scroll.scrollHeight;
})
// para que al dar click se cree un canal
var botonCrearCanal = document.querySelector("#btnCrearCanal").addEventListener("click",crearCanal);
var botonBuscarGlobal = document.querySelector("#btnBuscarCanalGlobal").addEventListener("click",buscarCanalglobal);

xhr.onreadystatechange = function(){
    if (xhr.readyState == 4)
    {
        var respuesta = JSON.parse(xhr.responseText);
        console.log(respuesta);
        if (respuesta["canales"])
        {
            canalesGlobales.innerHTML = "";
            for (canales of respuesta["canales"])
            {
                var hijo = document.createElement("div");
                hijo.innerHTML = "<p style='margin:0px; hover{background-color:#B3D8C5;}'>"+canales+"</p>";
                canalesGlobales.appendChild(hijo);
            }
        }
    }
}
/////////////////////////////////////////////////FUNCTIONS////////////////////////////////////////////////////////////////

// Pruebas de peticiones AJAX con servidor
function AServer() {
    var aServidor = { "saludo": "Hola jefe te puedes mover?, lo demas, el impacto... no hay nada que hacer" };
    xhr.open("POST", "/", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    // Send request
    xhr.send(Object.keys(aServidor)[0] + "=" + aServidor[Object.keys(aServidor)[0]]);

    xhr.onload = () => {
        var respuesta = JSON.parse(xhr.responseText);
        // Update the result div
        if (respuesta) {
            console.log("ServerContesta: "+respuesta);
        }
        else {
            console.log("no tengo nada")
        }
    }
    return false;
}

// funcion recursiva para aplicar clase global a todos los elementos
function recurAdd(tag) {
    var temp = document.querySelector(tag);
    temp.classList.add("global");
    if (!temp.children.length > 0) {
        return;
    } else {
        for (var i = 0; i < temp.children.length; i++) {
            recurAdd(tag + ">" + ":nth-child(" + Number(i + 1) + ")");
        }
    }
    return;
}

// funcion para aumentar tamaño del textarea
function auto_grow(element) {
    element.style.height = "70px";
    element.style.height = element.scrollHeight + "px";
}

// funcion para poner div que obliga al usuario a crear un usuario, si ya esta guardado en localstorage no aparece
function divUsuario() {
    var divGeneral = document.querySelector("#ingresar");
    if (localStorage.getItem("usuarioActual") == undefined) {
        divGeneral.setAttribute("style", "position:absolute; top:0px; left:0px; width:100vw; height:100vh; background-color:#F2F2F2; z-index:100; display:flex; flex-direccion:column; justify-content:center; align-items:center;");
        divGeneral.innerHTML = "<div><p>Hola ingresa un usuario para participar:</p><input type='text' placeholder=' Nombre de usuario'></input><button>Entrar</button></div>"
        divGeneral.children[0].children[1].style.width = "100%";
        divGeneral.children[0].children[2].addEventListener("click", guardarDatos);
    }
    else {
        divGeneral.setAttribute("style", "display:none;");
    }
    function guardarDatos() {
        if (divGeneral.children[0].children[1].value != undefined && divGeneral.children[0].children[1].value != "") {
            localStorage.setItem("usuarioActual", divGeneral.children[0].children[1].value);
            divGeneral.setAttribute("style", "display:none;");
        }
        else
            return;
    }
}

// Peticion para crear una room
function crearCanal() {
    var nombreCanal = document.querySelector("#newChan");
    if(nombreCanal.value != undefined && nombreCanal.value != "" && nombreCanal.value != null)
    {
        xhr.open("POST", "/crearCanal", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send("nuevoCanal="+nombreCanal.value+"&dueno="+localStorage.getItem("usuarioActual"));
    }
}
// peticion para buscar todos los canales existentes
function buscarCanalglobal(){
    var nombreCanal = document.querySelector("#buscarCanalGlobal");
    if(nombreCanal.value != undefined && nombreCanal.value != "" && nombreCanal.value != null)
    {
        xhr.open("POST", "/buscarCanalGlobal", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send("canalGlobal="+nombreCanal.value);
    }
    else
        return;
}


// Realizar el socket.emit con lo que tiene el text area si no esta nulo
function enviardatos() {
    var seleccion = document.querySelector("#txtmensaje");
    if (seleccion.value == "" || seleccion.value == null || seleccion.value == undefined) {
        return;
    }
    else {
        // crea nuevo objeto fecha actualizado
        var fecha = new Date();
        // emit de los datos
        socket.emit("socketMessage", { "seleccion": seleccion.value });
        // creacion del mensaje propio en pantalla
        let mensajeCaja = document.createElement("div");
        mensajeCaja.innerHTML = '<div class="mOwn global"><p class="global timestamp"></p><p class="global"></p></div>';
        mensajeCaja.classList.add("flexMessageRight");
        mensajeCaja.classList.add("global");
        mensajeCaja.children[0].children[1].innerHTML = seleccion.value;
        let chat = document.querySelector("#chatscroll");

        mensajeCaja.children[0].children[0].innerHTML = Dias[fecha.getDay()] + " " + fecha.getHours() + ":" + fecha.getMinutes() + ":" + fecha.getSeconds() + " " + localStorage.getItem("usuarioActual");
        chat.appendChild(mensajeCaja);
        seleccion.value = "";
    }
}



//ejecucion inmediata de funciones
recurAdd("html");
divUsuario();

