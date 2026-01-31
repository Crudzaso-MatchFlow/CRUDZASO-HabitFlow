let form = document.getElementById('formCreateOffer');
const titleOffer = document.getElementById('titleOffer');
const descriptionOffer = document.getElementById('descriptionOffer');
const professionOffer = document.getElementById('professionOffer');
const typeContract = document.getElementById('typeContract');
const locationOffer = document.getElementById('locationOffer');
const modeOffer = document.getElementById('modeOffer');
const salaryOffer = document.getElementById('salaryOffer');
const deadlineOffer = document.getElementById('deadlineOffer');
let submitBtn = document.getElementById('submitBtn');
let cancelBtn = document.getElementById('cancelBtn');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newOffer = {
        companyId: "",
        title: titleOffer.value,
        description: descriptionOffer.value,
        profession: professionOffer.value,
        typeContract: typeContract.value,
        location: locationOffer.value,
        mode: modeOffer.value,
        salary: salaryOffer.value,
        deadline: deadlineOffer.value,
        createdAt: new Date(),
        isActive: true
    }

    await fetch('http://localhost:3000/jobOffers', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newOffer)
    });

    alert('Oferta registrada correctamente');
    form.reset();
});
