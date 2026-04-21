'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Producto } from '@/types/producto';
import { Configuracion } from '@/types/configuracion';
import { formatCurrency } from '@/lib/utils';
import { MessageCircle, Package, Loader2, ChevronLeft, ChevronRight, X, ShoppingCart } from 'lucide-react';

const CONFIG_ID = 'tienda-config';
const IMAGEN_DEFAULT = 'https://placehold.co/400x400/e2e8f0/64748b?text=Sin+Imagen';

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState<{ producto: Producto; cantidad: number }[]>([]);
  const [imagenesActuales, setImagenesActuales] = useState<Record<string, number>>({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [touchStartX, setTouchStartX] = useState<{ productoId: string; x: number | null }>({ productoId: '', x: null });

  useEffect(() => {
    async function fetchData() {
      try {
        const [productosSnap, configSnap] = await Promise.all([
          getDocs(query(collection(db, 'productos'))),
          getDoc(doc(db, 'configuracion', CONFIG_ID)),
        ]);

        const rawProducts = productosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Producto[];
        const filteredProducts = rawProducts.filter((p) => p.mostrarEnCatalogo !== false && p.activo !== false);
        filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setProductos(filteredProducts);

        if (configSnap.exists()) {
          setConfig({ id: configSnap.id, ...configSnap.data() } as Configuracion);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const agregarAlCarrito = (producto: Producto) => {
    const existente = carrito.find((item) => item.producto.id === producto.id);
    if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }]);
    }
  };

  const quitarDelCarrito = (productoId: string) => {
    const existente = carrito.find((item) => item.producto.id === productoId);
    if (existente && existente.cantidad === 1) {
      setCarrito(carrito.filter((item) => item.producto.id !== productoId));
    } else if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === productoId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
      );
    }
  };

  const generarMensajeWhatsapp = () => {
    if (carrito.length === 0) return '';

    const mensaje = encodeURIComponent(
      `Hola, me interesan los siguientes productos:\n\n` +
        carrito
          .map(
            (item) =>
              `- ${item.producto.nombre} x${item.cantidad} (${formatCurrency(
                item.producto.precioVenta * item.cantidad
              )})`
          )
          .join('\n') +
        `\n\nTotal: ${formatCurrency(
          carrito.reduce(
            (sum, item) => sum + item.producto.precioVenta * item.cantidad,
            0
          )
        )}`
    );

    const phone = config?.whatsappNumber || '50600000000';
    return `https://wa.me/${phone}?text=${mensaje}`;
  };

  const getImagenes = (producto: Producto) => {
    return producto.imagenes?.length ? producto.imagenes : [IMAGEN_DEFAULT];
  };

  const siguienteImagen = (productoId: string, direction: number) => {
    const imagenes = getImagenes(
      productos.find((p) => p.id === productoId)!
    );
    const actual = imagenesActuales[productoId] || 0;
    const nuevo = (actual + direction + imagenes.length) % imagenes.length;
    setImagenesActuales({ ...imagenesActuales, [productoId]: nuevo });
  };

  const categoriasUnicas = [...new Set(
    productos.map((p) => p.categoria?.trim().toLowerCase()).filter(Boolean)
  )] as string[];
  const categorias = categoriasUnicas.sort();
  const productosFiltrados = categoriaSeleccionada
    ? productos.filter((p) => p.categoria?.trim().toLowerCase() === categoriaSeleccionada)
    : productos;

  const colorPrimario = config?.colorPrimario || '#6366f1';
  const nombreNegocio = config?.nombreNegocio || 'Catálogo de Productos';
  const descripcion = config?.descripcionNegocio || '';
  const hasLogo = config?.logoUrl && config.logoUrl.length > 0;
  const logoUrl = hasLogo ? config.logoUrl : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: colorPrimario }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header
        className="bg-white shadow-sm sticky top-0 z-10"
        style={{ borderBottom: `3px solid ${colorPrimario}` }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {hasLogo ? (
                <img src={logoUrl} alt={nombreNegocio} className="h-12 w-12 object-contain" />
              ) : (
                <Package className="h-8 w-8" style={{ color: colorPrimario }} />
              )}
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{ color: colorPrimario }}
                >
                  {nombreNegocio}
                </h1>
                {descripcion && (
                  <p className="text-sm text-gray-500">{descripcion}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setMostrarCarrito(!mostrarCarrito)}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg"
              style={{ backgroundColor: colorPrimario }}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{carrito.reduce((sum, item) => sum + item.cantidad, 0)}</span>
            </button>
          </div>

          {categorias.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setCategoriaSeleccionada('')}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  !categoriaSeleccionada
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  !categoriaSeleccionada
                    ? { backgroundColor: colorPrimario }
                    : undefined
                }
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                    categoriaSeleccionada === cat
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={
                    categoriaSeleccionada === cat
                      ? { backgroundColor: colorPrimario }
                      : undefined
                  }
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <div
                    className="absolute inset-0 touch-pan-y"
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      setTouchStartX({ productoId: producto.id, x: touch.clientX });
                    }}
                    onTouchEnd={(e) => {
                      if (touchStartX.productoId === producto.id && touchStartX.x !== null) {
                        const touch = e.changedTouches[0];
                        const diff = touchStartX.x - touch.clientX;
                        if (Math.abs(diff) > 30) {
                          const direction = diff > 30 ? 1 : -1;
                          const imagenes = getImagenes(producto);
                          const actual = imagenesActuales[producto.id] || 0;
                          const nuevo = (actual + direction + imagenes.length) % imagenes.length;
                          setImagenesActuales({ ...imagenesActuales, [producto.id]: nuevo });
                        }
                        setTouchStartX({ productoId: '', x: null });
                      }
                    }}
                  />
                  <img
                    key={imagenesActuales[producto.id] || 0}
                    src={getImagenes(producto)[imagenesActuales[producto.id] || 0]}
                    alt={producto.nombre}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = IMAGEN_DEFAULT;
                    }}
                  />
                  {getImagenes(producto).length > 1 && (
                    <>
                      <button
                        onClick={() => siguienteImagen(producto.id, -1)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => siguienteImagen(producto.id, 1)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {getImagenes(producto).map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              idx === (imagenesActuales[producto.id] || 0)
                                ? 'bg-white'
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {producto.nombre}
                  </h3>
                  {producto.descripcion && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {producto.descripcion}
                    </p>
                  )}
                  <p
                    className="text-xl font-bold mt-2"
                    style={{ color: colorPrimario }}
                  >
                    {formatCurrency(producto.precioVenta)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="flex-1 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: colorPrimario }}
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => {
                        window.open(
                          `https://wa.me/${config?.whatsappNumber || '50600000000'}?text=${encodeURIComponent(
                            `Hola, quiero comprar: ${producto.nombre} - ${formatCurrency(producto.precioVenta)}`
                          )}`,
                          '_blank'
                        );
                      }}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {mostrarCarrito && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMostrarCarrito(false)}
          />
          <div className="relative w-full max-w-md bg-white h-[85vh] rounded-t-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Tu Pedido</h2>
              <button
                onClick={() => setMostrarCarrito(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {carrito.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay productos en el pedido
                </p>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div
                      key={item.producto.id}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <img
                        src={getImagenes(item.producto)[0]}
                        alt={item.producto.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {item.producto.nombre}
                        </h3>
                        <p
                          className="font-semibold"
                          style={{ color: colorPrimario }}
                        >
                          {formatCurrency(item.producto.precioVenta)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => quitarDelCarrito(item.producto.id)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="font-medium w-6 text-center">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => agregarAlCarrito(item.producto)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(
                      carrito.reduce(
                        (sum, item) =>
                          sum + item.producto.precioVenta * item.cantidad,
                        0
                      )
                    )}
                  </span>
                </div>
                <a
                  href={generarMensajeWhatsapp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Solicitar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {!mostrarCarrito && carrito.length > 0 && (
        <button
          onClick={() => setMostrarCarrito(true)}
          className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 text-white py-4 px-6 shadow-lg hover:opacity-90 transition-opacity z-40"
          style={{ backgroundColor: colorPrimario }}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Ver Mi Pedido ({carrito.length})</span>
        </button>
      )}
    </div>
  );
}