// API
const url = "http://localhost:3000/candidates";

// Fincion Filter and Search
async function filterSearch() {
  // Variables DOM
  const viewResultados = document.querySelector(".resultados");
  const formFilter = document.querySelector("#formFilter");
  const searchInput = document.querySelector("#search");
  const searchForm = document.querySelector("#searchForm");
  // Control de Errores
  try {
    // Method Get Fetch
    const resp = await fetch(url);
    // Valido el estado de la peticion y creo un Obj para guardar el error y mostrarlo
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    // Guardo la data de mi peticion para poder usarla
    const dataResp = await resp.json();
    // Validamos posible estructura de la data
    const candidates = dataResp.candidates || dataResp;

    // Funcion para mostrar Resultados de busqueda
    function renderResults(filtered) {
      if (filtered.length === 0) {
        viewResultados.innerHTML = `<p>No hay resultados que cumplan los filtros</p>`;
      } else {
        viewResultados.innerHTML = filtered
          .map(
            (e) => `
          <div class="card mb-3 col-md-5 m-2">
            <h6 class="card-title m-3">Candidate</h6>
            <div class="card-body">
              <h6 class="card-subtitle">${e.name}</h6>
              <div class="row align-top">
                <div class="col-md-6">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3SwwQp_JZ1vjxqXeC6Oikp-TLWUWzSSR9hQ&s" alt="perfil" class="img-thumbnail mt-3" />
                </div>
                <div class="col-md-6">
                  <p class="text-end text">${e.profession}</p>
                </div>
              </div>
              <p class="card-text mt-3">${e.bio}</p>
              <button class="btn btn-primary">Math</button>
            </div>
          </div>
        `,
          )
          .join("");
      }
    }
    // Funcion para Filter and Search
    function applyFilters() {
      // Guardo parametros para Filtrar
      const categorias = [];
      if (document.getElementById("frontend").checked)
        categorias.push("frontend");
      if (document.getElementById("backend").checked)
        categorias.push("backend");
      if (document.getElementById("fullstack").checked)
        categorias.push("full stack");

      // Caturo el input y lo parseo a minuscula y descarto espacion en blanco
      const searchText = searchInput.value.toLowerCase().trim();

      // para cuando no se filtre muestre los Todos los candidatos
      let filtered = candidates;

      // Filtrar por categorías
      if (categorias.length > 0) {
        // Filtra las profesiones que coinsidan con las categorias[]
        filtered = filtered.filter((c) =>
          categorias.some((ctgrias) =>
            c.profession.toLowerCase().includes(ctgrias),
          ),
        );
      }

      // Filtrar por barra de búsqueda
      if (searchText) {
        // Busca por nombre o Profesion
        filtered = filtered.filter(
          (c) =>
            c.name
              .normalize("NFD") // Descompone caracteres
              .replace(/[\u0300-\u036f]/g, "") // Elimina los signos diacríticos
              .toLowerCase() // Todo en minusculas
              .includes(searchText) ||
            c.profession
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .includes(searchText),
        );
      }
      // Muestro en la function renderResults Los filtros Hechos
      renderResults(filtered);
    }

    // Eventos

    // Filtro
    formFilter.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
    });
    // Search Button
    searchForm.addEventListener("click", (e) => {
      e.preventDefault();
      applyFilters();
    });
    // Searc Input
    searchForm.addEventListener("input", (e) => {
      e.preventDefault();
      applyFilters();
    });
    // Render inicial
    renderResults(candidates);
  } catch (error) {
    console.error(error);
  }
}

filterSearch();
