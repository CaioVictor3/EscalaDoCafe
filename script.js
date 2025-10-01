let people = [];
let holidays = [];

const form = document.getElementById("personForm");
const personNameInput = document.getElementById("personName");
const personList = document.getElementById("personList");
const calendar = document.getElementById("calendar");
const messagesEl = document.getElementById("messages");
const monthSelect = document.getElementById("month");
const yearInput = document.getElementById("year");


document.addEventListener('DOMContentLoaded', () => {
  const alphaContinuousSwitch = document.getElementById('alphaContinuous');

  // Garante que o elemento existe antes de adicionar o listener
  if (alphaContinuousSwitch) {
      alphaContinuousSwitch.addEventListener('click', () => {
          // Condição 1: O switch está sendo ATIVADO?
          // Condição 2: A mensagem AINDA NÃO foi mostrada nesta sessão?
          if (alphaContinuousSwitch.checked && !sessionStorage.getItem('infoModalShown')) {
              
              // Cria uma instância do modal do Bootstrap usando o ID do HTML
              const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
              
              // Exibe o modal na tela
              infoModal.show();

              // Marca no sessionStorage que a mensagem já foi exibida para não mostrar de novo
              sessionStorage.setItem('infoModalShown', 'true');
          }
      });
  }


    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Populate year selector
    yearInput.innerHTML = ''; // Clear existing options
    const optionCurrentYear = document.createElement('option');
    optionCurrentYear.value = currentYear;
    optionCurrentYear.textContent = currentYear;
    yearInput.appendChild(optionCurrentYear);

    const optionNextYear = document.createElement('option');
    optionNextYear.value = currentYear + 1;
    optionNextYear.textContent = currentYear + 1;
    yearInput.appendChild(optionNextYear);

    monthSelect.value = currentMonth;
    yearInput.value = currentYear;

    updateMonthOptions();
});

function updateMonthOptions() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const selectedYear = parseInt(yearInput.value, 10);

    // Permitir apenas do mês atual até no máximo +2 meses
    const minGlobal = currentYear * 12 + currentMonth;
    const maxGlobal = minGlobal + 2; // até 2 meses à frente

    for (let i = 0; i < monthSelect.options.length; i++) {
        const optionGlobal = selectedYear * 12 + i;
        monthSelect.options[i].disabled = !(optionGlobal >= minGlobal && optionGlobal <= maxGlobal);
    }

    if (monthSelect.options[monthSelect.selectedIndex].disabled) {
        for (let i = 0; i < monthSelect.options.length; i++) {
            if (!monthSelect.options[i].disabled) {
                monthSelect.value = i;
                break;
            }
        }
    }
}

yearInput.addEventListener('change', updateMonthOptions);
monthSelect.addEventListener('change', updateMonthOptions);


if (localStorage.getItem("people")) {
  people = JSON.parse(localStorage.getItem("people"));
  updatePersonList();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const personName = personNameInput.value.trim();

  if (personName && !people.includes(personName)) {
    people.push(personName);
    personNameInput.value = "";
    updatePersonList();
  } else if (people.includes(personName)) {
    alert("Este nome já foi adicionado");
  }
});

function removerPessoa(index) {
  people.splice(index, 1);
  updatePersonList(); 
}

function updatePersonList() {
  personList.innerHTML = "";

  people.forEach((person, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = person;

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.textContent = 'Remover';

    removeButton.addEventListener('click', () => {
      removerPessoa(index);
    });

    listItem.appendChild(removeButton);
    personList.appendChild(listItem);
  });

  localStorage.setItem("people", JSON.stringify(people)); 
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function fetchHolidays(year) {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
    if (!response.ok) {
      throw new Error('Não foi possível buscar os feriados.');
    }
    const data = await response.json();
    holidays = data.map(holiday => {
      const [year, month, day] = holiday.date.split('-');
      return {
        date: `${day}/${month}/${year}`,
        name: holiday.name,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar feriados:', error);
    alert('Não foi possível carregar os feriados nacionais.');
  }
}

async function generateSchedule() {
  if (people.length < 2) {
    alert("Adicione ao menos 2 pessoas para gerar a escala.");
    return;
  }

  const monthSelect = document.getElementById("month");
  const yearInput = document.getElementById("year");
  const alphaContinuous = document.getElementById("alphaContinuous");
  const month = parseInt(monthSelect.value, 10);
  const year = parseInt(yearInput.value, 10);
  const periodStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentMonthIndexGlobal = currentYear * 12 + currentMonth;
  const selectedMonthIndexGlobal = year * 12 + month;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    alert("Não é possível gerar escalas para meses que já passaram.");
    return;
  }

  // Limitar a no máximo 2 meses futuros a partir do mês atual
  if (selectedMonthIndexGlobal - currentMonthIndexGlobal > 2) {
    alert("Você só pode criar escalas até 2 meses à frente do mês atual.");
    return;
  }

  await fetchHolidays(year);

  calendar.innerHTML = "";
  messagesEl && (messagesEl.innerHTML = "");

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const calendarHeader = document.createElement("h2");
  const dateForMonth = new Date(year, month);
  calendarHeader.textContent = `${dateForMonth.toLocaleString("pt-BR", { month: "long" })} ${year}`;
  calendar.appendChild(calendarHeader);

  const calendarTable = document.createElement("table");
  calendarTable.className = "table table-bordered text-center calendar-table";
  const tableHeader = document.createElement("tr");

  daysOfWeek.forEach((day) => {
    const th = document.createElement("th");
    th.textContent = day;
    tableHeader.appendChild(th);
  });

  calendarTable.appendChild(tableHeader);
  let tableBody = document.createElement("tr");

  function instrucoesEscalaAlfabetica(){
    alert("A escala em ordem alfabética contínua é uma escala em que os participantes são sorteados em ordem alfabética e continuam na mesma ordem até o próximo mês. Por exemplo, se o participante A foi sorteado no mês de janeiro, ele continuará sendo sorteado no mês de fevereiro, março, abril, etc., até que o mês de dezembro seja atingido. Após o mês de dezembro, a escala volta para o mês de janeiro e o processo se repete.");
  }

  // Preparar lista de pessoas conforme modo selecionado
  let assignmentList = [...people];
  let personIndex = 0;
  const storageKey = 'alphaContinuousLastPerson';
  const monthKey = `alphaSchedule_${periodStr}`; // guarda HTML e lista usada
  const monthPeopleKey = `alphaSchedule_people_${periodStr}`; // lista de participantes usada


  if (alphaContinuous && alphaContinuous.checked) {
    // Verifica se já existe escala salva para o mês e compara lista de participantes
    const savedScheduleHtml = localStorage.getItem(monthKey);
    const savedPeopleJson = localStorage.getItem(monthPeopleKey);
    const currentPeopleSorted = [...people].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    const savedPeople = savedPeopleJson ? JSON.parse(savedPeopleJson) : null;

    if (savedScheduleHtml && savedPeople && Array.isArray(savedPeople)) {
      const savedSorted = [...savedPeople].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
      const sameList = savedSorted.length === currentPeopleSorted.length && savedSorted.every((n, i) => n === currentPeopleSorted[i]);
      if (sameList) {
        // Reutiliza escala salva (não recria)
        calendar.innerHTML = savedScheduleHtml;
        if (messagesEl) messagesEl.innerHTML = `<div class="alert alert-info" role="alert">A escala para este mês já foi criada anteriormente em ordem alfabética. Exibindo a escala existente.</div>`;
        return;
      } else {
        if (messagesEl) messagesEl.innerHTML = `<div class="alert alert-warning" role="alert">A lista de participantes foi alterada. Gerando uma nova escala em ordem alfabética para este mês.</div>`;
      }
    }


    // Ordena alfabeticamente
    assignmentList.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    // Recupera último participante salvo anteriormente (se houver)
    const lastPerson = localStorage.getItem(storageKey);
    if (lastPerson) {
      if (assignmentList.includes(lastPerson)) {
        // Rotaciona a lista para começar no próximo nome após o último
        const lastIdx = assignmentList.indexOf(lastPerson);
        const startIdx = (lastIdx + 1) % assignmentList.length;
        assignmentList = assignmentList.slice(startIdx).concat(assignmentList.slice(0, startIdx));
      } else {
        // Caso o último salvo tenha sido removido, iniciar no próximo pela ordem alfabética
        // Encontrar o ponto de inserção: primeiro nome > lastPerson
        const cmp = (a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
        let startIdx = assignmentList.findIndex(name => cmp(name, lastPerson) > 0);
        if (startIdx === -1) startIdx = 0; // se todos são <= lastPerson, começa do início (ciclo)
        assignmentList = assignmentList.slice(startIdx).concat(assignmentList.slice(0, startIdx));
      }
    }
  } else {
    // Modo tradicional: embaralhar
    shuffleArray(assignmentList);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dayOfWeek = date.getDay();
    const formattedDate = `${String(i).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

    if (i === 1 && dayOfWeek !== 0) {
      for (let j = 0; j < dayOfWeek; j++) {
        const td = document.createElement("td");
        tableBody.appendChild(td);
      }
    }

    const td = document.createElement("td");
    td.id = `day-${i}`;

    const holiday = holidays.find(h => h.date === formattedDate);

    if (holiday) {
        td.innerHTML = `<strong>${i}</strong><br/><span class="holiday">${holiday.name}</span>`;
        td.classList.add("table-danger");
    } else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const morningPerson = assignmentList[personIndex % assignmentList.length];
        personIndex++;
        const afternoonPerson = assignmentList[personIndex % assignmentList.length];
        personIndex++;

        td.innerHTML = `
            <div class="d-flex flex-column align-items-center h-100 p-2">
                <strong>${i}</strong>
                <span class="morning-person small flex-grow-1">Manhã: ${morningPerson}</span>
                <span class="afternoon-person small flex-grow-1">Tarde: ${afternoonPerson}</span>
                <button class="btn btn-sm btn-outline-primary mt-auto edit-button-class d-print-none" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editDay(${i}, '${morningPerson}', '${afternoonPerson}')">Editar</button>
            </div>
        `;
    } else {
        td.innerHTML = `<strong>${i}</strong><br/>--`;
    }

    tableBody.appendChild(td);

    if (dayOfWeek === 6) {
      calendarTable.appendChild(tableBody);
      tableBody = document.createElement("tr");
    }
  }

  calendarTable.appendChild(tableBody);
  calendar.appendChild(calendarTable);

  // Se modo contínuo alfabético estiver ativo, salvar o último participante usado
  if (alphaContinuous && alphaContinuous.checked) {
    // O último participante é o último nome atribuído (considerando pessoaIndex - 1)
    const lastAssignedIndex = (personIndex - 1 + assignmentList.length) % assignmentList.length;
    const lastAssignedPerson = assignmentList[lastAssignedIndex];
    const periodKey = 'alphaContinuousLastSavedPeriod';
    try {
      const savedPeriod = localStorage.getItem(periodKey);
      if (savedPeriod !== periodStr) {
        localStorage.setItem(storageKey, lastAssignedPerson);
        localStorage.setItem(periodKey, periodStr);
      }
      // Persiste HTML da escala e a lista de participantes usada neste mês
      localStorage.setItem(monthKey, calendar.innerHTML);
      localStorage.setItem(monthPeopleKey, JSON.stringify(assignmentList));
      if (!messagesEl.innerHTML) {
        messagesEl.innerHTML = `<div class="alert alert-success" role="alert">Escala em ordem alfabética gerada com sucesso!</div>`;
      }
    } catch (e) {
      console.warn('Falha ao salvar informações no localStorage:', e);
    }
  }
}

function editDay(day, morningPerson, afternoonPerson) {
  const monthSelect = document.getElementById("month");
  const yearInput = document.getElementById("year");
  const month = parseInt(monthSelect.value, 10);
  const year = parseInt(yearInput.value, 10);

  

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    alert("Não é possível editar escalas para meses que já passaram.");
    return;
  }

  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    alert("A edição não é permitida nos sábados e domingos.");
    return;
  }

  document.getElementById('editDayInput').value = day;
  document.getElementById('morningPersonInput').value = morningPerson;
  document.getElementById('afternoonPersonInput').value = afternoonPerson;
}

function saveChanges() {
    const day = document.getElementById('editDayInput').value;
    const morningPerson = document.getElementById('morningPersonInput').value;
    const afternoonPerson = document.getElementById('afternoonPersonInput').value;

    const td = document.getElementById(`day-${day}`);
    const morningSpan = td.querySelector('.morning-person');
    const afternoonSpan = td.querySelector('.afternoon-person');

    if (morningSpan) morningSpan.textContent = `Manhã: ${morningPerson}`;
    if (afternoonSpan) afternoonSpan.textContent = `Tarde: ${afternoonPerson}`;

    const editButton = td.querySelector('.edit-button-class');
    if (editButton) {
        editButton.setAttribute('onclick', `editDay(${day}, '${morningPerson}', '${afternoonPerson}')`);
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    modal.hide();
}

function exportToPDF() {
    const calendarElement = document.getElementById("calendar");
    const watermarkElement = document.getElementById('pdf-watermark-container');

    if (!calendarElement.innerHTML.trim()) {
        alert("Nenhuma escala gerada para exportar.");
        return;
    }

    // Cria um wrapper temporário para o conteúdo de exportação
    const exportWrapper = document.createElement('div');
    exportWrapper.appendChild(calendarElement.cloneNode(true));
    exportWrapper.appendChild(watermarkElement.cloneNode(true));

    const monthSelect = document.getElementById("month");
    const yearInput = document.getElementById("year");
    const month = parseInt(monthSelect.value, 10);
    const year = parseInt(yearInput.value, 10);

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const monthName = monthNames[month];
    const filename = `Escala do café - ${monthName} ${year}.pdf`;

    document.body.classList.add('exporting-pdf');

    const buttonsToHide = calendarElement.querySelectorAll(
        '.edit-button-class, .holiday-button'
    );
    buttonsToHide.forEach(button => {
        button.style.display = 'none';
    });

    const previousInlineWidth = calendarElement.style.width;

    const options = {
        margin: [10, 10, 10, 10],
        filename: filename,
        html2canvas: {
            scale: 2,
            scrollY: 0,
            backgroundColor: '#ffffff'
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
            mode: ["avoid-all"],
        },
    };

    console.log('Iniciando exportação PDF...');

    setTimeout(() => {
        html2pdf()
            .set(options)
            .from(exportWrapper)
            .save()
            .catch(error => {
                console.error('Erro na exportação:', error);
                alert('Erro ao exportar PDF: ' + error.message);
            })
            .finally(() => {
                buttonsToHide.forEach(button => {
                    button.style.display = '';
                });
                calendarElement.style.width = previousInlineWidth;
                document.body.classList.remove('exporting-pdf');
            });
    }, 100);
}

