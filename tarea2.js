
// Cada producto que vende el super es creado con esta clase
class Producto {
    sku;            // Identificador único del producto
    nombre;         // Su nombre
    categoria;      // Categoría a la que pertenece este producto
    precio;         // Su precio
    stock;          // Cantidad disponible en stock

    constructor(sku, nombre, precio, categoria, stock) {
        this.sku = sku;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;

        // Si no me definen stock, pongo 10 por default
        if (stock) {
            this.stock = stock;
        } else {
            this.stock = 10;
        }
    }

}


// Creo todos los productos que vende mi super
const queso = new Producto('KS944RUR', 'Queso', 10, 'lacteos', 15);
const xbox = new Producto('KS944xbox', 'xbox', 10, 'video juegos', 4);
const gaseosa = new Producto('FN312PPE', 'Gaseosa', 5, 'bebidas');
const cerveza = new Producto('PV332MJ', 'Cerveza', 20, 'bebidas');
const arroz = new Producto('XX92LKI', 'Arroz', 7, 'alimentos', 20);
const fideos = new Producto('UI999TY', 'Fideos', 5, 'alimentos');
const lavandina = new Producto('RT324GD', 'Lavandina', 9, 'limpieza');
const shampoo = new Producto('OL883YE', 'Shampoo', 3, 'higiene', 50);
const jabon = new Producto('WE328NJ', 'Jabon', 4, 'higiene', 3);

// Genero un listado de productos. Simulando base de datos
const productosDelSuper = [queso, gaseosa, cerveza, arroz, fideos, xbox, lavandina, shampoo, jabon];
// Cada cliente que venga a mi super va a crear un carrito
class Carrito {
    productos;      // Lista de productos agregados
    categorias;     // Lista de las diferentes categorías de los productos en el carrito
    precioTotal;    // Lo que voy a pagar al finalizar mi compra

    // Al crear un carrito, empieza vació
    constructor() {
        this.precioTotal = 0;
        this.productos = [];
        this.categorias = [];
    }
    /*
     * función que agrega @{cantidad} de productos con @{sku} al carrito
     */
    async agregarProducto(sku, cantidad) {
        if (!sku) {
            throw new Error(`EL SKU NO ENCONTRADO`);  //La sku falta
        } else if (!cantidad) {
            console.error('no has especificado una cantidad, así que la pondré en uno'); 
            cantidad = 1;
        }

        try{
            //looking for the product
            const productReference = await findProductBySku(sku);
            const producto = new ProductoEnCarrito(productReference.sku, productReference.nombre, cantidad, productReference.precio, productReference.categoria) // sku nombre cantidad precio
            // checking if there is enought stock
            if (productReference.stock < cantidad || productReference.stock === 0) {
                console.error(`El producto con la sku: ${sku} no tiene stock`); 
                return;
            }
            
            const productoEncontrado = this.agregarProducto();
            productoEncontrado.then((mensaje) =>{
              console.log(mensaje);
            })
            .catch(mensaje => {
              console.log(mensaje);
            })


            // if the product exist in the cart or else
            let productAlreadyInCart = this.productos.find(product => product.sku === sku)
            if (productAlreadyInCart) {
                this.precioTotal += (productAlreadyInCart.precio * cantidad);
                // if the category doesnt alreasy exist, it adds the category list, if it does, it does nothing.
                let categoryAlreadyExist = this.categorias.find(thisCategory => thisCategory === productReference.categoria)
                !categoryAlreadyExist ? this.categorias.push(productReference.categoria) : null;

                // deleting stock
                productReference.stock -= cantidad;

                // adding cuantity
                productAlreadyInCart.cantidad += cantidad;
            } else {
                this.productos.push(producto);
                this.precioTotal += (producto.precio * cantidad);

                let categoryAlreadyExist = this.categorias.find(thisCategory => thisCategory === producto.categoria)
                if (!categoryAlreadyExist) {
                    this.categorias.push(productReference.categoria);
                }

                // deleting stock
                productReference.stock -= cantidad;
            }
        } catch{
            throw new Error(`El producto con el sku: ${sku} no se pudo encontrar}`);
        }
    }
  


    eliminarProducto(sku, cantidad){
        if(!sku){
            throw new Error(`el sku no se encuentra`); 
        } else if(cantidad < 0 || cantidad === undefined){
            console.log('no ha especificado una cantidad, por lo que se ha establecido en 1');
            cantidad = 1;
        }
        return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let productExist = this.productos.find(product => product.sku === sku);
                    if (productExist) {

                        if (productExist.cantidad > cantidad) {

                            productExist.cantidad -= cantidad;
                            this.precioTotal -= (productExist.precio * cantidad);
                            
                            resolve(`se ha actualizado el precio Total y se ha restado la cantidad del producto ${JSON.stringify(productExist)}`)

                        } else if (productExist.cantidad <= cantidad) {
                            //eliminando categoría, comprueba si hay más productos con esta categoría. si no los hay, borra la categoría
                            let moreThanAProductThisCategory = this.productos.filter(product => product.categoria === productExist.categoria);
                            if(moreThanAProductThisCategory.length === 1){
                                let indexCategory = this.categorias.indexOf(productExist.categoria);
                                this.categorias.splice(indexCategory, 1);
                            }
                            
                            let indexProduct = this.productos.indexOf(productExist);
                            this.productos.splice(indexProduct, 1);
                            
                            
                            let precioTotal = this.precioTotal - (productExist.precio * cantidad);
                            this.precioTotal = (precioTotal < 0) ? 0 : precioTotal;
                            

                            resolve(`Se ha eliminado el producto del carrito.${JSON.stringify(productExist)}`)
                        }
                    } else {
                        reject(`El producto con el sku: ${sku} no existe en el carrito`);
                    }
                }, 0);

            })
    }

}




 
// Cada producto que se agrega al carrito es creado con esta clase
class ProductoEnCarrito {
    sku;       // Identificador único del producto
    nombre;    // Su nombre
    cantidad;  // Cantidad de este producto en el carrito
    precio;    // Precio del producto
    categoria; // Categoria del producto
    constructor(sku, nombre, cantidad, precio, categoria) {
        this.sku = sku;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.precio = precio;
        this.categoria = categoria;
    }
}

// Función que busca un producto por su sku en "la base de datos"
function findProductBySku(sku) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundProduct = productosDelSuper.find(product => product.sku === sku);
            if (foundProduct) {
                resolve(foundProduct);
            } else {
                reject(`Product ${sku} not found`);
            }
        }, 1500);
    });

}

const productoEncontrado = findProductBySku();
productoEncontrado.then((mensaje) =>{
  console.log(mensaje);
})
.catch(mensaje => {
  console.log(mensaje);
})


//CARRITOS DE LOS CLIENTES
console.log("CARRITOS de los clientes **************************************************************************************");

console.log("CARRITO CLIENTE 1");


let carrito1 = new Carrito();

carrito1.agregarProducto("XX92LKI",2);
carrito1.agregarProducto("FN312PPE", 1);
carrito1.agregarProducto("PV332MJ",2);
carrito1.agregarProducto("OL883YE", 3);
console.log(carrito1);

console.log("*************************************************************************************************");

console.log("CARRITO CLIENTE 2");

let carrito2 = new Carrito();
carrito2.agregarProducto("XX92LKI",2);
carrito2.agregarProducto("XX92LKI",2);
carrito2.agregarProducto("RT324GD",1);
carrito2.agregarProducto("UI999TY", 5);
carrito2.agregarProducto("PV332MJ", 1);
console.log(carrito2);

console.log("*************************************************************************************************");

console.log("CARRITO CLIENTE 3");

let carrito3 = new Carrito();
carrito3.agregarProducto("XX92LKI",4);
carrito3.agregarProducto("OL883YE",5);
carrito3.agregarProducto("KS944RUR",2);
carrito3.agregarProducto("UI999TY",3);

//Aqui intentamos agregar un producto que no esta en los productosDelSuper nos da un error,producto no encontrado
console.log("(Aqui intentamos agregar un producto que no esta en los productosDelSuper nos da un error,producto no encontrado)");
carrito3.agregarProducto("NoExiste", 6);
console.log(carrito3);

console.log("****************************************************************************************************************************************");
console.log(productosDelSuper);
console.log('');
///AGREGANDO PRODUCTO AL CARRITO
console.log("AGREGANDO PRODUCTO AL CARRITO *************************************************************************************");

carrito1.agregarProducto('WE328NJ', 2);
carrito2.agregarProducto('WE328NJ', 1);
carrito1.agregarProducto('KS944RUR', 2);
 carrito2.agregarProducto(shampoo.sku, 3);

// ELIMINAR PRODUCTO *****************************************************************************

console.log("***************************************************************************** ");
console.log("*********************************************************************************************************************** ");
carrito2.eliminarProducto('FN312PPE',1)
.then(msg => console.log(msg))
.catch(err => console.log(err));
  
/*
 Eliminar una cantidad menor a la cantidad en el carrito
 /*
  carrito2.eliminarProducto('XX92LKI', 6)
  .then(msg => console.log(msg))
  .catch(err => console.error(err));

Eliminar una cantidad mayor a la cantidad en el carrito
carrito.eliminarProducto("", 15)
  .then(msg => console.log(msg))
  .catch(err => console.error(err));

Eliminar un producto que no está en el carrito
carrito.eliminarProducto("", 5)
  .then(msg => console.log(msg))
  .catch(err => console.error(err));
*/

