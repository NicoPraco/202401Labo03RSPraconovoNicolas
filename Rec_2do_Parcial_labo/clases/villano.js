import { Persona } from './persona.js';

export class Villano extends Persona {
    enemigo; // String
    robos; //Integrer
    asesinatos; // Integrer Mayor a 0

    constructor(nombre, apellido, fecha, enemigo, robos, asesinatos) {
        super(null, nombre, apellido, fecha);

        this.enemigo = enemigo;
        this.robos = robos;
        this.asesinatos = asesinatos;
    }

    // Metodos principales

    toString() {
        return `${this.id} ${this.nombre} ${this.apellido} ${this.edad} ${this.sueldo} ${this.ventas}`;
    }

    toJson() {
        return JSON.stringify((this.id, this.nombre, this.apellido, this.edad, this.sueldo, this.ventas));
    }

    update(data) {
        super.update(data);
        this.enemigo = data.enemigo;
        this.robos = data.robos;
        this.asesinatos = data.asesinatos;
    }
}
