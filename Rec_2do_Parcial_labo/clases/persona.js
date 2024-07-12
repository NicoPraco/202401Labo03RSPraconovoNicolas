export class Persona {
    id;
    nombre;
    apellido;
    edad;

    constructor(id, nombre, apellido, edad) {
        this.id = parseInt(id);
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = parseInt(edad);
    }

    // Metodos principales

    toString() {
        return `${this.id} ${this.nombre} ${this.apellido} ${this.edad}`;
    }

    toJson() {
        return JSON.stringify((this.id, this.nombre, this.apellido, this.edad));
    }

    update(data) {
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.edad = Number(data.edad);
    }
}
