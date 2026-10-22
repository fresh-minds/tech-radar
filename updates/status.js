/* Update metadata is generated from this deployment's Git history at build time. */
(function () {
  'use strict';
  var dateFormat = new Intl.DateTimeFormat('nl-NL', { dateStyle: 'long', timeZone: 'Europe/Amsterdam' });
  var timeFormat = new Intl.DateTimeFormat('nl-NL', { timeStyle: 'short', timeZone: 'Europe/Amsterdam' });
  var editionFormat = new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  function element(tag, text, className) {
    var node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function formatEdition(value) {
    if (!/^\d{4}\.(0[1-9]|1[0-2])$/.test(value)) return value || 'Onbekend';
    return editionFormat.format(new Date(value.replace('.', '-') + '-01T00:00:00Z'));
  }

  function validUpdate(update) {
    return update && !Number.isNaN(Date.parse(update.date)) && /^[a-f0-9]{40}$/.test(update.sha);
  }

  function commitLink(update, text) {
    var link = element('a', text, 'source-link');
    link.href = 'https://github.com/fresh-minds/tech-radar/commit/' + update.sha;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function render(status) {
    var navigation = document.getElementById('navigation');
    navigation.replaceChildren();
    status.units.forEach(function (unit) {
      var link = element('a', unit.label);
      link.href = unit.path;
      navigation.appendChild(link);
    });
    var active = element('a', 'Updates');
    active.href = '/updates/';
    active.setAttribute('aria-current', 'page');
    navigation.appendChild(active);

    var latest = status.latestUpdate;
    var latestDate = document.getElementById('latest-date');
    var detail = document.getElementById('latest-detail');
    if (validUpdate(latest)) {
      var date = new Date(latest.date);
      var time = element('time', dateFormat.format(date));
      time.dateTime = latest.date;
      latestDate.replaceChildren(time);
      var matching = status.units.filter(function (unit) { return unit.lastUpdate && unit.lastUpdate.sha === latest.sha; });
      detail.textContent = timeFormat.format(date) + ' · ' + matching.map(function (unit) { return unit.label; }).join(', ');
      var source = document.getElementById('latest-source');
      source.href = commitLink(latest).href;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.hidden = false;
    } else {
      latestDate.textContent = 'Datum niet beschikbaar';
      detail.textContent = 'De huidige edities staan hieronder.';
    }

    var body = document.getElementById('radar-updates');
    body.replaceChildren();
    status.units.forEach(function (unit) {
      var row = element('tr');
      var name = element('th');
      name.scope = 'row';
      var link = element('a', unit.label);
      link.href = unit.path;
      name.appendChild(link);
      row.appendChild(name);
      var updated = element('td');
      if (unit.entryCount === 0) {
        updated.appendChild(element('span', 'Nog niet gepubliceerd', 'draft'));
      } else if (validUpdate(unit.lastUpdate)) {
        var date = new Date(unit.lastUpdate.date);
        var time = element('time', dateFormat.format(date));
        time.dateTime = unit.lastUpdate.date;
        updated.appendChild(time);
        updated.appendChild(element('span', timeFormat.format(date), 'date-time'));
      } else updated.textContent = 'Datum niet beschikbaar';
      row.appendChild(updated);
      row.appendChild(element('td', unit.entryCount === 0 ? '—' : formatEdition(unit.edition)));
      row.appendChild(element('td', String(unit.entryCount)));
      var source = element('td');
      if (validUpdate(unit.lastUpdate)) source.appendChild(commitLink(unit.lastUpdate, 'Bekijk wijziging ↗'));
      else source.textContent = '—';
      row.appendChild(source);
      body.appendChild(row);
    });
  }

  async function getJson(url) {
    var response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Updategegevens niet beschikbaar');
    return response.json();
  }

  async function load() {
    try {
      var status = await getJson('/update-status.json');
      if (!Array.isArray(status.units) || !status.units.length) throw new Error('Geen updategegevens');
      render(status);
    } catch (error) {
      var notice = document.getElementById('notice');
      notice.textContent = 'De exacte wijzigingsdatums zijn tijdelijk niet beschikbaar.';
      notice.hidden = false;
      try {
        var units = await getJson('/units.json');
        var results = await Promise.all(units.map(async function (unit) {
          var data = await getJson('/' + unit.id + '/radar-data.json');
          return { id: unit.id, label: unit.label, path: unit.path, edition: data.date, entryCount: data.entries.length, lastUpdate: null };
        }));
        render({ latestUpdate: null, units: results });
      } catch (fallbackError) {
        document.getElementById('latest-date').textContent = 'Updategegevens niet beschikbaar';
        document.getElementById('radar-updates').replaceChildren();
        notice.textContent = 'Het updateoverzicht kon niet worden geladen. Probeer het later opnieuw.';
      }
    }
  }
  load();
}());
