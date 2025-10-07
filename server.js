const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/matches', async (req, res) => {
  try {
    const eaUrl = 'https://proclubs.ea.com/api/fc/clubs/matches?matchType=friendlyMatch&platform=common-gen5&clubIds=13488';
    const response = await fetch(eaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      return res.status(500).json({ error: 'EA API did not return JSON', contentType });
    }

    const data = await response.json();

    const simplified = data.map(match => {
      try {
        const homeId = match.homeClubId?.toString();
        const awayId = match.awayClubId?.toString();
        const home = match.clubs?.[homeId];
        const away = match.clubs?.[awayId];

        if (!home || !away || !home.details || !away.details) return null;

        return {
          matchId: match.matchId,
          timestamp: match.timestamp,
          timeAgo: `${match.timeAgo?.number ?? "?"} ${match.timeAgo?.unit ?? ""}`,
          homeTeam: home.details.name,
          homeScore: parseInt(home.score),
          awayTeam: away.details.name,
          awayScore: parseInt(away.score),
          result: parseInt(home.score) > parseInt(away.score)
            ? `${home.details.name} won`
            : parseInt(home.score) < parseInt(away.score)
            ? `${away.details.name} won`
            : "Draw"
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
