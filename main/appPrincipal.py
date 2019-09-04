import requests
import os
import json
import re

from funciones          import organizar
from flask              import Flask, session,render_template,request,jsonify
from flask_session      import Session
from flask_socketio     import SocketIO, emit, join_room,leave_room

###########################################CODIGO CONFIGURACION###############################################################
app = Flask(__name__)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
# confiugrar socketio
app.config["SECRET_KEY"] = "secretisima!"
socketio = SocketIO(app)

##############################################################################################################################

# En esta variable voy a guardar todos los datos de la aplicacion
DatosApp = {"botas":{"dueno":"RicardoChavez","mensajes":[]},"botines":{"dueno":"beto","mensajes":[]},"buenas":{"dueno":"coso","mensajes":[]},"bestias":{"dueno":"beth","mensajes":[]},"burritos":{"dueno":"vez","mensajes":[]},"carros":{"dueno":"Ric","mensajes":[]}}



@app.route("/",methods=["GET","POST"])
def pagPrincipal():
    if request.method == "POST":
        mensaje = request.form.get("saludo")
        print("lo uqe recibi",mensaje)
        return jsonify({"respuesta":"te he respondido","texto":mensaje})
    return render_template("home.html")



@app.route("/buscarCanalGlobal",methods=["POST"])
def buscarGlobal():
    if request.method == "POST":
        mensaje = request.form.get("canalGlobal")
        retorno = []
        print(mensaje)
        for llaves in DatosApp.keys():
            if re.search(mensaje,llaves):
                retorno[len(retorno):]=[llaves]
        return jsonify({"canales":retorno})    



@app.route("/crearCanal",methods=["POST"])
def crearCanal():
    if request.method == "POST":
        temproom = request.form.get("nuevoCanal")
        if (temproom not in DatosApp.keys()):
            DatosApp[temproom] = {}
            DatosApp[temproom]["dueno"] = request.form.get("dueno")
            DatosApp[temproom]["mensajes"] = []
            print(DatosApp)
            return jsonify({"respuesta":"se ha creado  una room"})
        else:
            return jsonify({"respuesta":"La room ya existe"}) 



@app.route("/pedirCanal",methods=["POST"])
def canalPedido():
    if request.method == "POST":
        tempCanal = request.form.get("canalDeseado")
        return jsonify({"canalDeseado":tempCanal,"propiedades":DatosApp[tempCanal]})
    else:
        return jsonify({"respuesta":"no tengo nada"})



@socketio.on("connect")
def test_connect():
    emit("testConexion",{"conexion":"Te has conectado, te he detectado pasame tu room actual"})



@socketio.on("socketMessage")
def socket(datos):
    print(datos)
    longitud = len(DatosApp[datos["room"]]["mensajes"])
    DatosApp[datos["room"]]["mensajes"][longitud:] = [{"dueno":datos["dueno"],"timeStamp":datos["timeStamp"],"txtMessage":datos["mensaje"]}] 
    print(DatosApp[datos["room"]]["mensajes"])
    emit("mensajeServer",{"mensaje":datos["mensaje"],"timeStamp":datos["timeStamp"],"dueno":datos["dueno"]},room = datos["room"])

@socket.on("join")
def uniraRoom(datos):
        join_room(datos["canalAUnir"])
        emit()


if __name__ == '__main__':
    socketio.run(app)