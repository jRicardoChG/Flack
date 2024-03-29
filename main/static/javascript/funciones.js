var xhr = new XMLHttpRequest();
var Dias = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var canalesGlobales = document.querySelector("#canalesGlobales").children[1];
var canalesPropiosdiv = document.querySelector("#canalesPropios").children[1];
var listaAmigos = document.querySelector("#desAmigos").children[1];
var canalActual = document.querySelector("#tituloCanal");
// para que al dar click se cree un canal
var botonCrearCanal = document.querySelector("#btnCrearCanal").addEventListener("click", crearCanal);
var botonBuscarGlobal = document.querySelector("#btnBuscarCanalGlobal").addEventListener("click", buscarCanalglobal);
var botonBuscarCanalPropio = document.querySelector("#btnBuscarCanalPropios").addEventListener("click", buscarCanalPropio);
var botonBuscarAmigos = document.querySelector("#btnBuscarAmigos").addEventListener("click",buscarAmigos);
var botonDesconectarse = document.querySelector("#btnDesconectarse").addEventListener("click",DescUsuario);
////////////////////////////////////////////////MAIN CODE/////////////////////////////////////////////////////////////////
// Conectar con el servidor
var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);
socket.on("connect", mensaje => {
    console.log("me he conectado");
    console.log("datos de conexion:",mensaje)
    document.querySelector("#boton2").addEventListener("click", enviardatos);
})

// verificar union  ala room
socket.on("respuestaServer", mensaje => {
    console.log("me confirmas que me conecte ala room: ",Object.keys(mensaje)[0],mensaje[Object.keys(mensaje)[0]]);
})

// Test de coenxion con el servidor
socket.on("testConexion", mensaje => {
    console.log(mensaje["conexion"]);
})
// Cuando se envia un mensaje en el chat
socket.on("mensajeServer", mensaje => {
    recibido = mensaje;
    console.log(recibido);
    if (recibido == "" || recibido == null || recibido == undefined) {
        return;
    }
    else {
        let mensajeCaja = document.createElement("div");
        if (recibido["dueno"] == localStorage.getItem("usuarioActual"))
        {
            mensajeCaja.innerHTML = '<div class="mOwn global "><div class="position"><p class="global timestamp"></p><p class="global"></p><div onclick="activarBorrarMensaje(this)" class="click"></div></div><p style="text-align:center;" class="global timestamp ocultar" onclick="pedirBorrarMensaje(this)">Delete</p></div>';
            mensajeCaja.classList.add("flexMessageRight");
            
        }
        else
        {
            mensajeCaja.innerHTML = '<div class="mCom global"><div class="position"><p class="global timestamp"></p><p class="global"></p><div onclick="activarBorrarMensaje(this)" class="click"></div></div><p style="text-align:center;" class="global timestamp ocultar" onclick="pedirBorrarMensaje(this)">Detele</p></div>';
            mensajeCaja.classList.add("flexMessageLeft");
        }  
        mensajeCaja.classList.add("global");
        mensajeCaja.children[0].children[0].children[0].innerHTML = recibido["mensaje"];
        let chat = document.querySelector("#chatscroll");
        mensajeCaja.children[0].children[0].children[0].innerHTML = recibido.timeStamp +" "+ recibido.dueno;
        mensajeCaja.children[0].children[0].children[1].innerHTML = recibido.mensaje;
        chat.appendChild(mensajeCaja);
    }
})
socket.on("mensajeBorrado", respuesta => {
            // aqui tengo uqe cargar todos los mensajes que retomo de la solicitud de canal
            let chat = document.querySelector("#chatscroll");
            chat.innerHTML = "";
            console.log("al borrar mensaje: ",respuesta);
            for (i=0;i<respuesta.propiedades.mensajes.length;i++)
            {
                console.log("estoy imprimiendo mensjaes del canal recien solicitado")
                console.log(respuesta.propiedades.mensajes[i])
                crearMensajeCaja(respuesta.propiedades.mensajes[i]);
            }
})
// Para poder enviar datos con enter
window.addEventListener("keypress", (event) => {
    if (event.keyCode === 13 && !event.shiftKey && localStorage.getItem("canalActual")!=null) {
        enviardatos();
    }
    else
        return;
});
// Para que el div de mensajes este siempre abajo y meustre todos los mensajes
window.addEventListener("DOMNodeInserted", function () {
    var scroll = document.querySelector("#chatscroll");
    scroll.scrollTop = scroll.scrollTop + scroll.scrollHeight;
})
/// procesando todas las respuestas del servidor
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        var respuesta = JSON.parse(xhr.responseText);
        console.log("respuesta del servidor: "+respuesta);
        if(respuesta["amigos"])
        {
            listaAmigos.innerHTML = "";
            for (canalesAmigo of respuesta["amigos"]) {
                var hijo = document.createElement("div");
                hijo.innerHTML = "<p onclick='pedirCanal(this)' class='global white'>" + canalesAmigo + "</p>";
                listaAmigos.appendChild(hijo);
            }
        }
        if (respuesta["canales"]) {
            canalesGlobales.innerHTML = "";
            for (canales of respuesta["canales"]) {
                var hijo = document.createElement("div");
                hijo.innerHTML = "<p onclick='pedirCanal(this)' class='global' >" + canales + "</p>";
                canalesGlobales.appendChild(hijo);
            }
        }
        if (respuesta["canalesPropios"]) {
            console.log("he recibido una repsuesta de propios: ",respuesta["canalesPropios"])
            canalesPropiosdiv.innerHTML = "";
            for (canales of respuesta["canalesPropios"]) {
                var hijo = document.createElement("div");
                hijo.innerHTML = "<p onclick='pedirCanal(this)' style='margin:0px; hover{background-color:#B3D8C5;}'>" + canales + "</p>";
                canalesPropiosdiv.appendChild(hijo);
            }
        }

        if (respuesta["canalDeseado"] && respuesta["propiedades"]) {
            console.log("respuesta del servidor a solicitud de canal: "+respuesta["canalDeseado"]);
            console.log("respuesta del servidor a solicitud de canal: ",respuesta["propiedades"]);
            canalActual.innerHTML = "<h2>" + respuesta["canalDeseado"] + "</h2>";
            localStorage.setItem("canalActual",respuesta["canalDeseado"]);
            // localStorage.setItem("propiedades",JSON.stringify(respuesta["propiedades"]));
            disableTextArea();
            // aqui tengo uqe cargar todos los mensajes que retomo de la solicitud de canal
            let chat = document.querySelector("#chatscroll");
            chat.innerHTML = "";
            for (i=0;i<respuesta.propiedades.mensajes.length;i++)
            {
                console.log("estoy imprimiendo mensjaes del canal recien solicitado")
                console.log(respuesta.propiedades.mensajes[i])
                crearMensajeCaja(respuesta.propiedades.mensajes[i]);
            }
        }
        if(respuesta["verificarStorage"])
        {
            console.log("el servidor ha respondido para la verificacion del canal en Storage: ",respuesta["verificarStorage"])
            if(respuesta["verificarStorage"]=="true")
                return;
            else
            {
                localStorage.removeItem("canalActual");
                disableTextArea();   
            }
        }
    }
}
/////////////////////////////////////////////////FUNCTIONS////////////////////////////////////////////////////////////////

function crearMensajeCaja(mensajeDatos)
{
    // creacion del mensaje propio en pantalla
    let mensajeCaja = document.createElement("div");
    if (mensajeDatos["dueno"] == localStorage.getItem("usuarioActual"))
    {
        mensajeCaja.innerHTML = '<div class="mOwn global"><div class="position"><p class="global timestamp"></p><p class="global"></p><div onclick="activarBorrarMensaje(this)" class="click"></div></div><p style="text-align:center;" class="global timestamp ocultar" onclick="pedirBorrarMensaje(this)">Delete</p></div>';
        mensajeCaja.classList.add("flexMessageRight");
    }
    else
    {
        mensajeCaja.innerHTML = '<div class="mCom global"><div class="position"><p class="global timestamp"></p><p class="global"></p><div onclick="activarBorrarMensaje(this)" class="click"></div></div><p style="text-align:center;" class="global timestamp ocultar" onclick="pedirBorrarMensaje(this)">Delete</p></div>';
        mensajeCaja.classList.add("flexMessageLeft");
    }  
    mensajeCaja.classList.add("global");
    let chat = document.querySelector("#chatscroll");
    mensajeCaja.children[0].children[0].children[0].innerHTML = mensajeDatos.timeStamp +" "+ mensajeDatos.dueno;
    mensajeCaja.children[0].children[0].children[1].innerHTML = mensajeDatos.txtMessage;
    chat.appendChild(mensajeCaja);
}

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
            console.log("ServerContesta: " + respuesta);
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
    if (localStorage.getItem("usuarioActual") == undefined || localStorage.getItem("usuarioActual") == null) {
        divGeneral.setAttribute("style", "position:absolute; top:0px; left:0px; width:100vw; height:100vh; background-color:#F2F2F2; z-index:100; display:flex; flex-direccion:column; justify-content:center; align-items:center;");
        divGeneral.innerHTML = "<div><p>Hola ingresa un usuario para participar:</p><input type='text' placeholder=' Nombre de usuario'></input><button>Entrar</button></div>"
        divGeneral.children[0].children[1].style.width = "100%";
        divGeneral.children[0].children[2].addEventListener("click", () => guardarDatos(divGeneral));
    }
    else {
        var userConectado = document.querySelector("#userActualConectado");
        userConectado.innerHTML = localStorage.getItem("usuarioActual");
        divGeneral.setAttribute("style", "display:none;");
    }

}

function guardarDatos(divGeneral) {
    if (divGeneral.children[0].children[1].value != undefined && divGeneral.children[0].children[1].value != "") {
        localStorage.setItem("usuarioActual", divGeneral.children[0].children[1].value);
        divGeneral.setAttribute("style", "display:none;");
        var userConectado = document.querySelector("#userActualConectado");
        userConectado.innerHTML = localStorage.getItem("usuarioActual");
    }
    else
        return;
}
// funcion para deshabilitar textarea si no existe un canal elegido en localsotrage
function disableTextArea()
{
    if(localStorage.getItem("canalActual")==null || localStorage.getItem("canalActual")==undefined || localStorage.getItem("canalActual")=="")
    {
        var botonEnviar = document.querySelector("#boton2");
        botonEnviar.setAttribute("disabled","true");
        botonAttached.setAttribute("disabled","true");
        var temp = document.querySelector("#tituloCanal");
        temp.innerHTML = "<div><h2>Sin canal Escoge uno</h2></div>";
    }
    else
    {
        let chat = document.querySelector("#chatscroll");
        chat.innerHTML = "";
        canalActual.innerHTML = "<h2>" + localStorage.getItem("canalActual") + "</h2>";
        var botonAttached = document.querySelector("#boton1");
        var botonEnviar = document.querySelector("#boton2");
        botonEnviar.removeAttribute("disabled");
        socket.emit("join",{"canalAUnir":localStorage.getItem("canalActual")})
    }
}

// Peticion para crear una room
function crearCanal() {
    var nombreCanal = document.querySelector("#newChan");
    if (nombreCanal.value != undefined && nombreCanal.value != "" && nombreCanal.value != null) {
        xhr.open("POST", "/crearCanal", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send("nuevoCanal=" + nombreCanal.value + "&dueno=" + localStorage.getItem("usuarioActual"));
    }
}
// peticion para buscar todos los canales existentes
function buscarCanalglobal() {
    var nombreCanal = document.querySelector("#buscarCanalGlobal");
    if (nombreCanal.value != undefined && nombreCanal.value != "" && nombreCanal.value != null) {
        xhr.open("POST", "/buscarCanalGlobal", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send("canalGlobal=" + nombreCanal.value);
    }
    else
        return;
}

function buscarCanalPropio() 
{
    var nombreCanal = document.querySelector("#buscarCanalPropios");
    if (nombreCanal.value != undefined && nombreCanal.value != "" && nombreCanal.value != null) {
        xhr.open("POST", "/buscarCanalPropio", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send("canalPropio=" + nombreCanal.value+"&dueno="+localStorage.getItem("usuarioActual"));
    }
    else
        return;
}

// Realizar el socket.emit con lo que tiene el text area si no esta nulo
function enviardatos() {
    var seleccion = document.querySelector("#txtmensaje");
    console.log("esto tomo del textarea",seleccion.value);
    if(verificarSoloEspacios(seleccion.value))
    {
        return;
    }
    if (seleccion.value == "" || seleccion.value == null || seleccion.value == undefined ) {
        return;
    }
    else {
        // crea nuevo objeto fecha actualizado
        var fecha = new Date();
        // creacion del mensaje propio en pantalla
        // let mensajeCaja = document.createElement("div");
        // mensajeCaja.innerHTML = '<div class="mOwn global"><p class="global timestamp"></p><p class="global"></p></div>';
        // mensajeCaja.classList.add("flexMessageRight");
        // mensajeCaja.classList.add("global");
        // mensajeCaja.children[0].children[1].innerHTML = seleccion.value;
        // let chat = document.querySelector("#chatscroll");
        var timeStampActual = Dias[fecha.getDay()] + " " + fecha.getHours() + ":" + fecha.getMinutes() + ":" + fecha.getSeconds();
        // mensajeCaja.children[0].children[0].innerHTML = timeStampActual + " " + localStorage.getItem("usuarioActual");
        // chat.appendChild(mensajeCaja);
        // emit de los datos
        socket.emit("socketMessage", { "mensaje": seleccion.value,"dueno":localStorage.getItem("usuarioActual"),"timeStamp": timeStampActual,"room":localStorage.getItem("canalActual") });
        seleccion.value = "";

    }
}

// pedir canal especifico al servidor
function pedirCanal(element) {
    var canalAPedir = element.innerHTML;
    var canalADejar = localStorage.getItem("canalActual");
    xhr.open("POST", "/pedirCanal", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    socket.emit("join",{"canalAUnir":canalAPedir});
    socket.emit("leave",{"canalADejar":canalADejar});
    xhr.send("canalDeseado=" + canalAPedir);
}

function PedirCanalAlVolver()
{
    if(localStorage.getItem("canalActual")==null || localStorage.getItem("canalActual")==undefined || localStorage.getItem("canalActual")=="")
    {
        return;
    }
    else
    {
        xhr.open("POST", "/pedirCanal", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send("canalDeseado=" + localStorage.getItem("canalActual"));
    }
    
}

// funcion para verificar que el textarea no esta lleno de epsaicos
function verificarSoloEspacios(txtString)
{
    Split = txtString.split("");
    while(Split[0]=="" || Split[0]==" " || Split[0].charCodeAt()==10)
    {
        Split.shift();
        if(Split.toString()==[])
            break;
    }
    if (Split.length >=1)
    {
        console.log(Split, false);
        return false;
    }
    else
    {
        console.log(Split,true);
        return true;
    }
}

// verificar si canal en local storage existe
function verificarlocalStorage()
{
    if(localStorage.getItem("canalActual")!=null && localStorage.getItem("canalActual")!=undefined)
    {
        // el programa no puede continuar si este señor no obtiene su respuesta
        xhr.open("POST","/verificarStorage",false);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send("canalStorage="+localStorage.getItem("canalActual"));
    }    
}
// funcion para buscar amigos
function buscarAmigos()
{
    var amigo = document.querySelector("#buscarAmigos");
    if(amigo.value != null && amigo.value != undefined && amigo.value != "" )
    {
        xhr.open("POST","/buscarAmigos",true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send("amigos="+amigo.value);
    }
    else
    {
        return;
    }
}

function DescUsuario(){
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("canalActual");
    let chat = document.querySelector("#chatscroll");
    chat.innerHTML = "";
    canalActual.innerHTML = "<h2>Sin canal Escoge uno</h2>";
    verificarlocalStorage();
    divUsuario();
    disableTextArea();
    // PedirCanalAlVolver();
}

function pedirBorrarMensaje(elemento){
    timestamp = elemento.parentElement.children[0].children[0].innerHTML.split(" ");
    dueno = timestamp[2];
    time = timestamp[0]+" "+timestamp[1];
    texto = elemento.parentElement.children[0].children[1].innerHTML;
    socket.emit("borrarMensaje",{"dueno":dueno,"timestamp":time,"texto":texto,"canal":localStorage.getItem("canalActual"),"userActual":localStorage.getItem("usuarioActual")})
}

function activarBorrarMensaje(element){
    if(element.parentElement.parentElement.children[1].classList.value.includes("ocultar"))
        element.parentElement.parentElement.children[1].classList.remove("ocultar");
    else
        element.parentElement.parentElement.children[1].classList.add("ocultar");
}


//ejecucion inmediata de funciones
recurAdd("html");
verificarlocalStorage();
divUsuario();
disableTextArea();
PedirCanalAlVolver();
