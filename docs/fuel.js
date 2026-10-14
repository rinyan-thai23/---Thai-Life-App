'use strict';
// Official publisher-supported embed: no proxy or credentials required.
document.getElementById('fuel-refresh').addEventListener('click',()=>{
  const frame=document.getElementById('fuel-frame');
  frame.src='https://oil-price.bangchak.co.th/BcpOilPrice1/en?refresh='+Date.now();
});
