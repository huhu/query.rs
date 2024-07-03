<div
  style="position:relative;text-align:center;margin:20px;margin-bottom:60px;"
>
  <input
    id="crate-name"
    type="text"
    style="width:400px;height:32px;padding:0 12px;border-radius:10px;border:1px solid #f9bb2daa;"
  />
  <span class="btn btn-primary">Add crate</span>
  <div class="toast"></div>
</div>
<div class="subtitle-text crate-list-filter">
  <span
    >You have indexed <span id="crate-count">0</span> crate(s), disk usage:
    <span id="storage-usage">0</span>/10 MB</span
  >
  <span>
    Sort by:
    <select name="crate-filter">
      <option value="time">Indexed time</option>
      <option value="alphanumeric">Alphanumeric</option>
      <option value="searches">Searches</option>
    </select>
  </span>
</div>
<ul class="crate-list text"></ul>
