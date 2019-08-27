var xhr = new XMLHttpRequest();

function AServer()
{
    var aServidor = {"saludo":"Hola jefe te puedes mover?, lo demas, el impacto... no hay nada que hacer"};
    xhr.open("POST","/",true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    // Send request
    xhr.send(Object.keys(aServidor)[0]+"="+aServidor[Object.keys(aServidor)[0]]);

    xhr.onload = () => {
        var respuesta = JSON.parse(xhr.responseText);
        // Update the result div
        if (respuesta) {
            var algo = document.createElement("p")
            algo.innerHTML = Object.keys(respuesta)[1]+": "+respuesta[Object.keys(respuesta)[1]];
            document.body.appendChild(algo)
        }
        else
        {
          console.log("no tengo nada")  
        }
      }
      return false;
}
function comenzarSocket()
{
    var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);

}

function socketMessage()
{
    //conectar con el servidor
    var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);
    socket.on("connect", function(){
        document.querySelector("#boton2").onclick = enviardatos();
    })

    function enviardatos()
    {
        seleccion = document.querySelector("#txtmensaje").value;
        socket.emit("socketMessage",{"seleccion":seleccion});
    }
    socket.on("mensajeServer", datos => {
        console.log(datos["seleccion"]);
    } )

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

// funcion recursiva para quitarlas
function recurRem(tag) {
    var temp = document.querySelector(tag);
    temp.classList.remove("global");
    if (!temp.children.length > 0) {
        return;
    } else {
        for (var i = 0; i < temp.children.length; i++) {
            recurRem(tag + ">" + ":nth-child(" + Number(i + 1) + ")");
        }
    }
    return;
}
function auto_grow(element) {
    element.style.height = "70px";
    element.style.height = element.scrollHeight+"px";
}

recurAdd("html");

