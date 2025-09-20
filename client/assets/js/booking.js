const form = document.getElementById('booking-form');
const successEl = document.getElementById('booking-success');
const errorEl = document.getElementById('booking-error');

async function submitBooking(payload){
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if(!res.ok){
    throw new Error('Request failed');
  }
  return res.json();
}

if(form){
  form.addEventListener('submit', async (e) => {
    if(!form.checkValidity()){
      e.preventDefault();
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      time: data.time,
      partySize: parseInt(data.partySize, 10) || 1,
      notes: data.notes || ''
    };
    try{
      await submitBooking(payload);
      successEl.classList.remove('d-none');
      errorEl.classList.add('d-none');
      form.reset();
      form.classList.remove('was-validated');
    }catch(err){
      successEl.classList.add('d-none');
      errorEl.classList.remove('d-none');
    }
  });
}
