import requests
import os
import json
import re

from funciones          import organizar
from flask              import Flask, session,render_template,request,jsonify
from flask_session      import Session
from flask_socketio     import SocketIO, emit

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
DatosApp = {"botas":{"dueno":"RicardoChavez","mensajes":{"mensaje1":{"dueno":"Karin","timeStamp":"laquesea","txtMensaje":"severo todo es muy bonito"},"mensaje2":{"dueno":"Pedro","timeStamp":"laqueseap","txtMensaje":"severo pppp"},"mensaje2":{"dueno":"Carlos","timeStamp":"laqueseac","txtMensaje":"severo todo es muy bonitoccccccc"},"mensaje3":{"dueno":"Karine","timeStamp":"laqueseaeeee","txtMensaje":"severo todo es muy bonitoeeeeeee"},"mensaje4":{"dueno":"Karini","timeStamp":"laqueseaiiiii","txtMensaje":"severo todo es muy bonitoiiiiiii"}}},"botines":{},"buenas":{},"bestias":{},"burritos":{},"carros":{}}


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
    print(datos["mensaje"])
    DatosApp[]
    emit("mensajeServer",{"mensaje":datos["mensaje"],"timeStamp":datos["mensaje"]["timeStamp"],"dueno":datos["mensaje"]["dueno"]},broadcast=True)



if __name__ == '__main__':
    socketio.run(app)