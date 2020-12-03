
//Colores
const celeste = "#BBDEFB";
const black = "#651FFF";
const blue = "#2196F3";
const ch = "#A7FFEB";

var inactivo = true;

// GRAFO DIBUJADO
var grafo = {
  network: null,
  data: null,
  options: null,
  cargar: function(noc, edc) {
    var nodes = [
      {
        id: 1,
        label: "q1",
        color: {
          border: blue,
          background: noc === "q1" ? ch : celeste
        }
      },
      {
        id: 2,
        label: "q2",
        color: {
          border: blue,
          background: noc === "q2" ? ch : celeste
        }
      },
      {
        id: 3,
        label: "q3",
        color: {
          border: blue,
          background: noc === "q3" ? ch : celeste
        }
      }
    ];

    // create an array with edges
    var edges = [
      {
        from: 1,
        to: 1,
        label: edc == 2 ? "" : " \n\na | a | R",
        color: { color: edc == 1 || edc == 2 ? black : "#2196F3" }
      },
      {
        from: 1,
        to: 1,
        label: edc == 1 ? "" : "b | a | R",
        color: { color: edc == 2 || edc == 1 ? black : "#2196F3" }
      },
      {
        from: 1,
        to: 2,
        label: "_ | _ | L",
        color: { color: edc == 3 ? black : "#2196F3" }
      },
      {
        from: 2,
        to: 2,
        label: " a | a | L",
        color: { color: edc == 4 ? black : "#2196F3" }
      },
      {
        from: 2,
        to: 3,
        label: " _ | _ | R",
        color: { color: edc == 5 ? black : "#2196F3" }
      }
    ];

    this.data = {
      nodes: nodes,
      edges: edges
    };

    this.options = {
      width: "100%",
      height: "100%",
      physics: { enabled: false },
      nodes: {
        borderWidth: 3,
        scaling: {
          min: 30,
          max: 40
        }
      },

      edges: {
        width: 2,
        shadow: { enabled: true, size: 30 },
        arrows: "to"
      },

      interaction: {
        dragNodes: false,
        dragView: false,
        selectable: false,
        zoomView: false
      },
      layout: {
        hierarchical: {
          enabled: true,
          levelSeparation: 150,
          nodeSpacing: 30,
          blockShifting: true,
          edgeMinimization: true,
          sortMethod: "directed",
          direction: "LR"
        }
      }
    };

    grafo.renderizar();
  },
  renderizar: function() {
    // create a network
    var container = document.getElementById("mynetwork");
    this.network = new vis.Network(container, this.data, this.options);
    this.network.setSize("700", "280");
  }
};

// CINTA DE LA MAQUINA
var cinta = {
  exp_reg: /^(a|b)+$/,
  compilada: false,
  cabecera_index: 1,
  contenido: [],

  cargar: function(cntnd) {
    var esPalabra = this.exp_reg.exec(cntnd);
    if (esPalabra) {
      this.cabecera_index = 1;
      this.contenido = [];

      cntnd = "_" + cntnd + "_";
      this.contenido = cntnd.split("");
      this.buscar(1, true);
      this.compilada = true;

      $("#estadolb").text("Estado Actual: q1");
      $("#movlb").text("Movimientos: 0");
      maquina.compilar(cntnd);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        html:
          "No puedes compilar una palabra que <b>no corresponde al lenguaje (a|b)+ </b> !"
      });
    }
  },

  buscar: function(posicion, renderizar) {
    this.cabecera_index = posicion;
    if (renderizar) {
      this.renderizar();
    }
  },

  renderizar: function() {
    var celdas = [];

    for (let i = 0; i < this.contenido.length; i++) {
      var celda = $('<input class="nodo" type="text" disabled/>');
      celda.val(this.contenido[i]);
      if (this.cabecera_index === i) {
        celda.addClass("cabecera");
      }
      celdas.push(celda);
    }

    $("#cinta")
      .children()
      .remove();
    $("#cinta").append(celdas);

    $("#cinta").addClass("mover-cabecera");
    var returned = this.cabecera_index * 66 + 33;
    $("#cinta").scrollLeft(returned);
  },

  escribir: function(valor, renderizar) {
    this.contenido[this.cabecera_index] = valor;
    if (renderizar) {
      this.renderizar();
    }
  },

  leer: function() {
    var value = null;
    if (this.cabecera_index < this.contenido.length)
      value = this.contenido[this.cabecera_index];
    return value;
  },

  mover_l: function(renderizar) {
    this.cabecera_index--;
    if (renderizar) {
      this.renderizar();
    }
  },

  mover_r: function(renderizar) {
    this.cabecera_index++;
    if (renderizar) {
      this.renderizar();
    }
  }
};

// MAQUINA DE TURING
var maquina = {
  cadena: "",
  pause: true,
  estado_inicial: "q1",
  estado_detencion: ["q3"],
  estado_actual: null,
  nombre_estado_actual: null,
  movimientos: 0,
  estados: {
    q1: {
      a: { s: "q1", r: "a", m: "R", id: 1 },
      b: { s: "q1", r: "a", m: "R", id: 2 },
      _: { s: "q2", r: "_", m: "L", id: 3 }
    },
    q2: {
      a: { s: "q2", r: "a", m: "L", id: 4 },
      _: { s: "q3", r: "_", m: "R", id: 5 }
    },
    q3: {
      a: { s: "q3", r: "a", m: "F" }
    }
  },

  compilar: function(cadena) {
    this.movimientos = 0;
    this.pause = true;
    this.estado_inicial = "q1";
    grafo.cargar("q1", 0);
    this.estado_detencion = ["q3"];
    this.nombre_estado_actual = this.estado_inicial;
    this.estado_actual = this.estados[this.nombre_estado_actual];
    this.cadena = cadena;
  },

  play: function(render) {
    maquina.transicion(cinta.leer(), render);
    var delay = parseInt($(".velocidad select").val());
    delay = Math.max(delay, 0);
    setTimeout(function() {
      if (!maquina.pause) {
        maquina.play(render);
      }
    }, delay);
  },

  transicion: function(entrada, renderizar) {
    console.log(this.nombre_estado_actual);

    if (this.estado_detencion.indexOf(this.nombre_estado_actual) !== -1) {
      $("#m-cinta").removeClass("cargando");
      grafo.cargar("q3", 0);
      this.pause = true;
      return;
    }

    var instrucciones = this.estado_actual[entrada];
    if (!instrucciones) {
      console.log("Error");
      maquina.pause = true;
    } else {
      this.nombre_estado_actual = instrucciones.s;
      this.estado_actual = this.estados[instrucciones.s];
      grafo.cargar(this.nombre_estado_actual, instrucciones.id);
      cinta.escribir(instrucciones.r, renderizar);
      switch (instrucciones.m) {
        case "R":
          cinta.mover_r(renderizar);
          break;
        case "L":
          cinta.mover_l(renderizar);
          break;
        case "F":
          maquina.pause = true;
          grafo.cargar(0);
          cinta.cargar();
          maquina.compilar();
          break;
      }

      this.movimientos++;
      $("#estadolb").text("Estado Actual: " + this.nombre_estado_actual);
      $("#movlb").text("Movimientos: " + this.movimientos);
    }
  },

  resetear_todo: function() {
    grafo.cargar("", 0);
    cinta.compilada = false;
    cinta.cabecera_index = 1;
    cinta.contenido = [];
    this.compilar("");
    $("#estadolb").text("Estado Actual: q1");
    $("#movlb").text("Movimientos: 0");
  },

  resetear_suave: function() {}
};

$(document).ready(function() {
  if (inactivo) {
    grafo.cargar("q1", 0);
  }

  $("#compilar").click(() => {
    var cadena = $("#cadena").val();

    if (!(cadena === "")) {
      cinta.cargar(cadena);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        html: "No puedes compilar una palabra <b> sin caracteres </b>!"
      });
    }
  });

  $("#paso").click(function() {
    if (cinta.compilada) maquina.transicion(cinta.leer(), true);
    else
      Swal.fire({
        icon: "info",
        title: "Espera...",
        html: "Debes <b> compilar una palabra </b>!"
      });
  });

  $("#iniciar").click(() => {
    if (cinta.compilada) {
      if (maquina.pause) {
        var render = parseInt($(".velocidad select").val()) !== -1;
        maquina.pause = false;
        maquina.play(render);
      }
    } else
      Swal.fire({
        icon: "info",
        title: "Espera...",
        html: "Debes <b> compilar una palabra </b>!"
      });
  });

  $("#pausar").click(() => {
    if (cinta.compilada) {
      maquina.pause = true;
      cinta.renderizar();
    } else
      Swal.fire({
        icon: "info",
        title: "Espera...",
        html: "Debes <b> compilar una palabra </b>!"
      });
  });

  $("#reset").click(() => {
    maquina.resetear_todo();
    cinta.renderizar();
  });
});
