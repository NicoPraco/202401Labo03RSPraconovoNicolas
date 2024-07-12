import { Persona } from './clases/persona.js';
import { Villano } from './clases/villano.js';
import { Heroe } from './clases/heroe.js';

let lista = [];

const btnAgregar = document.getElementById('add-btn');

const btnAceptarFormABM = document.getElementById('abm-form-accept');
const btnCancelarFormABM = document.getElementById('abm-form-cancel');

// ======================================================================================================================================================

document.addEventListener('DOMContentLoaded', () => {
    const endpointURL = 'https://examenesutn.vercel.app/api/PersonasHeroesVillanos';

    MostrarSpinner();

    LoadData(endpointURL, function (success) {
        if (success) {
            OcultarSpinner();
        } else {
            console.error('Error al cargar los datos.');
        }
    });
});

btnAgregar.addEventListener('click', () => {
    MostrarFormularioParaAlta();
});

btnAceptarFormABM.addEventListener('click', () => {
    ManejadorBtnAcceptar();
});

btnCancelarFormABM.addEventListener('click', () => {
    LimpiarFormularioABM();
    OcultarFormularioABM();
    MostrarFormularioLista();
});

// ======================================================================================================================================================

// #region Region de Funciones | GET ELEMENTOS

function LoadData(url, callback) {
    const xmlRequest = new XMLHttpRequest();

    xmlRequest.open('GET', url, true);

    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState === XMLHttpRequest.DONE) {
            if (xmlRequest.status === 200) {
                const jsonResponse = xmlRequest.responseText;
                const dataList = GenerateList(jsonResponse);

                UpdateTable(dataList);
                lista = dataList;
                callback(true); // Llamar al callback con éxito
            } else {
                console.error('Error al cargar los datos.');
                callback(false); // Llamar al callback con error
            }
        }
    };

    xmlRequest.send();
}

function GenerateList(jsonString) {
    const data = JSON.parse(jsonString);
    const lista = [];

    data.forEach((item) => {
        if (item.alterEgo !== undefined) {
            // Es un Heroe
            const heroe = new Heroe(item.nombre, item.apellido, item.edad, item.alterEgo, item.ciudad, item.publicado);
            heroe.id = item.id;
            lista.push(heroe);
        } else if (item.enemigo !== undefined) {
            // Es un Villano
            const villano = new Villano(item.nombre, item.apellido, item.edad, item.enemigo, item.robos, item.asesinatos);
            villano.id = item.id;
            lista.push(villano);
        }
    });

    return lista;
}

//#endregion

// ======================================================================================================================================================

// #region Region de Funciones | ACTUALIZAR ELEMENTOS

function UpdateTable(dataList) {
    const tableContents = document.getElementById('table-contents');
    tableContents.innerHTML = '';

    dataList.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nombre}</td>
            <td>${item.apellido}</td>
            <td>${item.edad}</td>
            <td>${item.alterEgo || 'N/A'}</td>
            <td>${item.ciudad || 'N/A'}</td>
            <td>${item.publicado || 'N/A'}</td>
            <td>${item.enemigo || 'N/A'}</td>
            <td>${item.robos || 'N/A'}</td>
            <td>${item.asesinatos || 'N/A'}</td>
            <td><button class="modify-btn">Modificar</button></td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        tableContents.appendChild(row);

        const modifyButton = row.querySelector('.modify-btn');
        modifyButton.addEventListener('click', () => {
            ModificarElemento(index);
        });

        // Agregar evento click al botón de eliminar
        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            EliminarElemento(index);
        });
    });
}

//#endregion

// ======================================================================================================================================================

// #region Region de Funciones | MANEJADOR DEL BOTON ACEPTAR

async function ManejadorBtnAcceptar() {
    const accion = document.getElementById('abm-form-action-title').innerHTML.toLowerCase();

    if (accion === 'alta') {
        // Consulta ALTA

        const elemento = ObtenerDatosAlta();
        RealizarConsultaAlta(elemento);
    } else if (accion === 'eliminar') {
        // Consulta BAJA

        const id = document.getElementById('abm-form-id').value;

        const index = lista.findIndex((element) => element.id == id);

        if (index !== -1) {
            await RealizarConsultaBaja(index);
        } else {
            console.error('No se encontró el elemento con el ID especificado.');
        }
    } else if (accion === 'modificar') {
        // Consulta MODIFICAR

        const id = document.getElementById('abm-form-id').value;
        const elementoModificado = ObtenerDatosModificacion();
        RealizarConsultaModificacion(id, elementoModificado);
    }
}

//#endregion

// ========

//#region Region de Funciones | ALTA DE ELEMENTOS

function ObtenerDatosAlta() {
    const nombreABM = document.getElementById('abm-form-name').value;
    const apellidoABM = document.getElementById('abm-form-surname').value;
    const edadABM = document.getElementById('abm-form-age').value;
    const tipoElemento = document.getElementById('abm-form-type').value;

    const alterEgoABM = document.getElementById('abm-form-alter-ego').value;
    const ciudadABM = document.getElementById('abm-form-city').value;
    const publicadoABM = document.getElementById('abm-form-publish').value;

    const enemigoABM = document.getElementById('abm-form-enemigo').value;
    const robosABM = document.getElementById('abm-form-robs').value;
    const asesinatosABM = document.getElementById('abm-form-assasin').value;

    let elemento = null;

    if (tipoElemento === 'Heroe') {
        elemento = new Heroe(nombreABM, apellidoABM, edadABM, alterEgoABM, ciudadABM, publicadoABM);
    } else {
        elemento = new Villano(nombreABM, apellidoABM, edadABM, enemigoABM, robosABM, asesinatosABM);
    }

    return elemento;
}

function MostrarFormularioParaAlta() {
    document.getElementById('abm-form-action-title').innerText = 'Alta';

    LimpiarFormularioABM();
    HabilitarCamposFormulario();
    OcultarFormularioLista();
    MostrarFormularioABM();
    MostrarOpcionesSegunSelect();
}

function RealizarConsultaAlta(elemento) {
    MostrarSpinner();

    fetch('https://examenesutn.vercel.app/api/PersonasHeroesVillanos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(elemento),
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('No se pudo realizar la operación');
            }
        })
        .then((data) => {
            elemento.id = data.id;
            AgregarElementoALista(elemento);
            OcultarSpinner();
            OcultarFormularioABM();
            MostrarFormularioLista();
        })
        .catch((error) => {
            console.error(error);
            OcultarSpinner();
            OcultarFormularioABM();
            MostrarFormularioLista();
            alert('No se pudo realizar la operación');
        });
}

function AgregarElementoALista(elemento) {
    lista.push(elemento);
    UpdateTable(lista);
}

//#endregion

// ========

//#region Region de Funciones | BAJA DE ELEMENTOS

async function EliminarElemento(index) {
    const elemento = lista[index];

    document.getElementById('abm-form-action-title').innerText = 'Eliminar';
    document.getElementById('abm-form-id').value = elemento.id;
    document.getElementById('abm-form-name').value = elemento.nombre;
    document.getElementById('abm-form-surname').value = elemento.apellido;
    document.getElementById('abm-form-age').value = elemento.edad;
    document.getElementById('abm-form-type').value = elemento.alterEgo ? 'Heroe' : 'Villano';

    document.getElementById('abm-form-alter-ego').value = elemento.alterEgo || '';
    document.getElementById('abm-form-city').value = elemento.ciudad || '';
    document.getElementById('abm-form-publish').value = elemento.publicado || '';

    document.getElementById('abm-form-enemigo').value = elemento.enemigo || '';
    document.getElementById('abm-form-robs').value = elemento.robos || '';
    document.getElementById('abm-form-assasin').value = elemento.asesinatos || '';

    BloquearCamposFormulario();
    MostrarOpcionesSegunSelect();

    OcultarFormularioLista();
    MostrarFormularioABM();
}

async function RealizarConsultaBaja(index) {
    const elemento = lista[index];

    try {
        HabilitarCamposFormulario();
        MostrarSpinner();

        const response = await fetch('https://examenesutn.vercel.app/api/PersonasHeroesVillanos', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: elemento.id }),
        });

        if (response.ok) {
            lista.splice(index, 1);
            UpdateTable(lista);

            OcultarSpinner();
            OcultarFormularioABM();
            MostrarFormularioLista();
        } else {
            throw new Error('No se pudo realizar la operación');
        }
    } catch (error) {
        console.error(error);
        OcultarSpinner();
        OcultarFormularioABM();
        MostrarFormularioLista();
        alert('No se pudo realizar la operación');
    }
}

//#endregion

// ========

//#region Region de Funciones | MODIFICACION DE ELEMENTOS

function ModificarElemento(index) {
    const elemento = lista[index];

    document.getElementById('abm-form-action-title').innerHTML = 'Modificar';

    document.getElementById('abm-form-id').value = elemento.id;
    document.getElementById('abm-form-name').value = elemento.nombre;
    document.getElementById('abm-form-surname').value = elemento.apellido;
    document.getElementById('abm-form-age').value = elemento.edad;
    document.getElementById('abm-form-type').value = elemento.alterEgo ? 'Heroe' : 'Villano';

    document.getElementById('abm-form-alter-ego').value = elemento.alterEgo || '';
    document.getElementById('abm-form-city').value = elemento.ciudad || '';
    document.getElementById('abm-form-publish').value = elemento.publicado || '';

    document.getElementById('abm-form-enemigo').value = elemento.enemigo || '';
    document.getElementById('abm-form-robs').value = elemento.robos || '';
    document.getElementById('abm-form-assasin').value = elemento.asesinatos || '';

    OcultarFormularioLista();
    MostrarOpcionesSegunSelect();

    document.getElementById('abm-form-id').disabled = true;
    document.getElementById('abm-form-type').disabled = true;

    MostrarFormularioABM();
}

function RealizarConsultaModificacion(id, elementoModificado) {
    const index = lista.findIndex((element) => element.id == id);

    if (index !== -1) {
        MostrarSpinner();

        fetch(`https://examenesutn.vercel.app/api/PersonasHeroesVillanos`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(elementoModificado),
        })
            .then((response) => {
                if (response.ok) {
                    lista[index].nombre = elementoModificado.nombre;
                    lista[index].apellido = elementoModificado.apellido;
                    lista[index].edad = elementoModificado.edad;

                    if (elementoModificado instanceof Heroe) {
                        lista[index].alterEgo = elementoModificado.alterEgo;
                        lista[index].ciudad = elementoModificado.ciudad;
                        lista[index].publicado = elementoModificado.publicado;
                    } else {
                        lista[index].enemigo = elementoModificado.enemigo;
                        lista[index].robos = elementoModificado.robos;
                        lista[index].asesinatos = elementoModificado.asesinatos;
                    }
                    UpdateTable(lista);

                    OcultarFormularioABM();
                    MostrarFormularioLista();
                } else {
                    throw new Error('No se pudo realizar la operación');
                }
            })
            .catch((error) => {
                console.error(error);

                OcultarFormularioABM();
                MostrarFormularioLista();
                alert('No se pudo realizar la operación');
            })
            .finally(() => {
                OcultarSpinner();
            });
    } else {
        console.error('No se encontró el elemento con el ID especificado.');
    }
}

function ObtenerDatosModificacion() {
    const nombre = document.getElementById('abm-form-name').value;
    const apellido = document.getElementById('abm-form-surname').value;
    const edad = document.getElementById('abm-form-age').value;
    const tipo = document.getElementById('abm-form-type').value;

    const alterEgo = document.getElementById('abm-form-alter-ego').value;
    const ciudad = document.getElementById('abm-form-city').value;
    const publicado = document.getElementById('abm-form-publish').value;

    const enemigo = document.getElementById('abm-form-enemigo').value;
    const robos = document.getElementById('abm-form-robs').value;
    const asesinatos = document.getElementById('abm-form-assasin').value;

    let elementoModificado = null;

    if (tipo === 'Heroe') {
        elementoModificado = new Heroe(nombre, apellido, edad, alterEgo, ciudad, publicado);
    } else {
        elementoModificado = new Villano(nombre, apellido, edad, enemigo, robos, asesinatos);
    }

    return elementoModificado;
}

//#endregion

// ========

//#region Region de Funciones | MOSTRAR Y OCULTAR

function MostrarSpinner() {
    let contenedor = document.getElementById('contenedor-spinner');

    contenedor.classList.remove('hidden');
}

function OcultarSpinner() {
    let contenedor = document.getElementById('contenedor-spinner');

    contenedor.classList.add('hidden');
}

function MostrarFormularioLista() {
    let formLista = document.getElementById('list-form');

    formLista.classList.remove('hidden');
}

function OcultarFormularioLista() {
    let formLista = document.getElementById('list-form');

    formLista.classList.add('hidden');
}

function MostrarFormularioABM() {
    let formABM = document.getElementById('abm-form');

    formABM.classList.remove('hidden');
}

function OcultarFormularioABM() {
    let formABM = document.getElementById('abm-form');

    formABM.classList.add('hidden');
}

function MostrarOpcionesSegunSelect() {
    const select = document.getElementById('abm-form-type');

    select.addEventListener('change', () => {
        const selectValue = select.value;

        // HEROES

        const lblAlterEgo = document.getElementById('abm-form-lbl-alter-ego');
        const inputAlterEgo = document.getElementById('abm-form-alter-ego');

        const lblCiudad = document.getElementById('abm-form-lbl-city');
        const inputCiudad = document.getElementById('abm-form-city');

        const lblPublicado = document.getElementById('abm-form-lbl-publish');
        const inputPublicado = document.getElementById('abm-form-publish');

        // VILLANOS

        const lblEnemigos = document.getElementById('abm-form-lbl-enemigo');
        const inputEnemigos = document.getElementById('abm-form-enemigo');

        const lblRobos = document.getElementById('abm-form-lbl-robs');
        const inputRobos = document.getElementById('abm-form-robs');

        const lblAsesinatos = document.getElementById('abm-form-lbl-assasin');
        const inputAsesinatos = document.getElementById('abm-form-assasin');

        if (selectValue === 'Heroe') {
            // OCULTO LOS QUE NO VAN
            lblEnemigos.classList.add('hidden');
            inputEnemigos.classList.add('hidden');

            lblRobos.classList.add('hidden');
            inputRobos.classList.add('hidden');

            lblAsesinatos.classList.add('hidden');
            inputAsesinatos.classList.add('hidden');

            // MUESTRO LOS QUE VAN
            lblAlterEgo.classList.remove('hidden');
            inputAlterEgo.classList.remove('hidden');

            lblCiudad.classList.remove('hidden');
            inputCiudad.classList.remove('hidden');

            lblPublicado.classList.remove('hidden');
            inputPublicado.classList.remove('hidden');
        } else if (selectValue === 'Villano') {
            // OCULTO LOS QUE NO VAN
            lblAlterEgo.classList.add('hidden');
            inputAlterEgo.classList.add('hidden');

            lblCiudad.classList.add('hidden');
            inputCiudad.classList.add('hidden');

            lblPublicado.classList.add('hidden');
            inputPublicado.classList.add('hidden');

            // MUESTRO LOS QUE VAN
            lblEnemigos.classList.remove('hidden');
            inputEnemigos.classList.remove('hidden');

            lblRobos.classList.remove('hidden');
            inputRobos.classList.remove('hidden');

            lblAsesinatos.classList.remove('hidden');
            inputAsesinatos.classList.remove('hidden');
        }
    });
    select.dispatchEvent(new Event('change'));
}

function LimpiarFormularioABM() {
    document.getElementById('abm-form-id').value = '';
    document.getElementById('abm-form-name').value = '';
    document.getElementById('abm-form-surname').value = '';
    document.getElementById('abm-form-age').value = '';

    document.getElementById('abm-form-alter-ego').value = '';
    document.getElementById('abm-form-city').value = '';
    document.getElementById('abm-form-publish').value = '';

    document.getElementById('abm-form-enemigo').value = '';
    document.getElementById('abm-form-robs').value = '';
    document.getElementById('abm-form-assasin').value = '';
}

function HabilitarCamposFormulario() {
    document.getElementById('abm-form-id').disabled = false;
    document.getElementById('abm-form-name').disabled = false;
    document.getElementById('abm-form-surname').disabled = false;
    document.getElementById('abm-form-age').disabled = false;

    document.getElementById('abm-form-type').disabled = false;

    document.getElementById('abm-form-alter-ego').disabled = false;
    document.getElementById('abm-form-city').disabled = false;
    document.getElementById('abm-form-publish').disabled = false;

    document.getElementById('abm-form-enemigo').disabled = false;
    document.getElementById('abm-form-robs').disabled = false;
    document.getElementById('abm-form-assasin').disabled = false;
}

function BloquearCamposFormulario() {
    document.getElementById('abm-form-id').disabled = true;
    document.getElementById('abm-form-name').disabled = true;
    document.getElementById('abm-form-surname').disabled = true;
    document.getElementById('abm-form-age').disabled = true;

    document.getElementById('abm-form-type').disabled = true;

    document.getElementById('abm-form-alter-ego').disabled = true;
    document.getElementById('abm-form-city').disabled = true;
    document.getElementById('abm-form-publish').disabled = true;

    document.getElementById('abm-form-enemigo').disabled = true;
    document.getElementById('abm-form-robs').disabled = true;
    document.getElementById('abm-form-assasin').disabled = true;
}

//#endregion
