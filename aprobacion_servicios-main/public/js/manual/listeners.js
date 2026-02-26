manual_button.addEventListener('click', (e) => {
  const text = manual_button.textContent.trim();
  if (text == '?'){
    document.getElementById('app-body').style.display    = 'none';
    document.getElementById('manual-body').style.display = 'block';
    manual_button.textContent                            = '<'
    show_section('signup')
  }else{
    document.getElementById('app-body').style.display    = 'block';
    document.getElementById('manual-body').style.display = 'none';
    manual_button.textContent                            = '?'
  }
})