import { Persona } from './persona.js';

export class Heroe extends Persona {
    alterEgo; // String
    ciudad; // String
    publicado; // Integrer - Mayor a 1940

    constructor(nombre, apellido, edad, alterEgo, ciudad, publicado) {
        super(null, nombre, apellido, edad);
        this.alterEgo = alterEgo;
        this.ciudad = ciudad;
        this.publicado = parseInt(publicado);
    }

    // Metodos principales

    toString() {
        return `${this.id} ${this.nombre} ${this.apellido} ${this.edad} ${this.alterEgo} ${this.ciudad} ${this.publicado}`;
    }

    toJson() {
        return JSON.stringify((this.id, this.nombre, this.apellido, this.edad, this.alterEgo, this.ciudad, this.publicado));
    }

    update(data) {
        super.update(data);
        this.alterEgo = data.alterEgo;
        this.ciudad = data.ciudad;
        this.publicado = data.publicad;
    }
}
