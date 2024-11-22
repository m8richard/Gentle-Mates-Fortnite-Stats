import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, User, Crosshair, Heart, Target, Zap, Activity, Swords, Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";

const FortniteStatsDisplay = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [playerTournaments, setPlayerTournaments] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);

  const API_KEY = '15003d12-baf7-4ac1-b5a1-0aeb8dff76b6';

  const players = [
    { id: '0fbe9a0b66894685b4cad62824f4e5ac', name: 'Player A' },
    { id: '4735ce9132924caf8a5b17789b40f79c', name: 'Player B' }
  ];

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('https://api.osirion.gg/fortnite/v1/tournaments?includeProgress=true', {
          headers: {
            'X-API-Key': API_KEY
          }
        });
        const data = await response.json();
        setTournaments(data.tournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    const fetchPlayerTournaments = async () => {
      if (!selectedPlayer) {
        setPlayerTournaments([]);
        return;
      }

      setLoadingTournaments(true);
      try {
        const participatedTournaments = await Promise.all(
          tournaments.map(async (tournament) => {
            try {
              const response = await fetch(
                `https://api.osirion.gg/fortnite/v1/tournaments/${tournament.eventId}?eventWindowId=${tournament.eventWindowId}&epicIds=${selectedPlayer}`,
                {
                  headers: {
                    'X-API-Key': API_KEY
                  }
                }
              );
              const data = await response.json();
              if (data.players && data.players.length > 0) {
                return tournament;
              }
              return null;
            } catch {
              return null;
            }
          })
        );

        const filteredTournaments = participatedTournaments.filter(t => t !== null);
        setPlayerTournaments(filteredTournaments);
        setSelectedTournament('');
        setPlayerStats(null);
      } catch (error) {
        console.error('Error fetching player tournaments:', error);
        setPlayerTournaments([]);
      }
      setLoadingTournaments(false);
    };

    fetchPlayerTournaments();
  }, [selectedPlayer, tournaments]);

  useEffect(() => {
    if (selectedPlayer && selectedTournament) {
      const fetchPlayerStats = async () => {
        setLoading(true);
        try {
          const tournament = tournaments.find(t => t.eventId === selectedTournament);
          const response = await fetch(
            `https://api.osirion.gg/fortnite/v1/tournaments/${selectedTournament}?eventWindowId=${tournament.eventWindowId}&epicIds=${selectedPlayer}`,
            {
              headers: {
                'X-API-Key': API_KEY
              }
            }
          );
          const data = await response.json();
          setPlayerStats(data.players[0]);
        } catch (error) {
          console.error('Error fetching player stats:', error);
        }
        setLoading(false);
      };

      fetchPlayerStats();
    }
  }, [selectedPlayer, selectedTournament, tournaments]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getTournamentSelectText = () => {
    if (!selectedPlayer) return "Choose a player first";
    if (loadingTournaments) return "Loading tournaments...";
    if (playerTournaments.length === 0) return "No tournaments found for this player";
    return "Choose a tournament";
  };

  const formatNumber = (num) => {
    if (num === -1) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex gap-4 items-start">
          <Card className="flex-1" style={{ 
            background: `linear-gradient(90deg, #9BE957 85%, #EF9BF4 100%)`
          }}>
            <CardHeader>
              <CardTitle className="text-2xl text-black flex items-center gap-2">
                <Trophy className="h-6 w-6 text-black" />
                Gentle Mates Fortnite Stats
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}`}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                <User className="h-5 w-5" />
                Select Player
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger 
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                >
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent 
                  ref={(ref) => {
                    if (ref) {
                      ref.style.backgroundColor = isDarkMode ? 'rgb(31, 41, 55)' : 'white';
                      ref.style.borderColor = isDarkMode ? 'rgb(55, 65, 81)' : '';
                    }
                  }}
                >
                  {players.map((player) => (
                    <SelectItem 
                      key={player.id} 
                      value={player.id}
                      className={`
                        ${isDarkMode ? 'text-gray-200 data-[highlighted]:bg-gray-700 data-[highlighted]:text-white' : 'text-gray-900 data-[highlighted]:bg-gray-100'}
                        cursor-pointer
                      `}
                    >
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                <Trophy className="h-5 w-5" />
                Select Tournament
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedTournament} 
                onValueChange={setSelectedTournament}
                disabled={!selectedPlayer || loadingTournaments || playerTournaments.length === 0}
              >
                <SelectTrigger 
                  className={`
                    ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                    ${playerTournaments.length === 0 && selectedPlayer && !loadingTournaments ? 
                      (isDarkMode ? 'text-gray-400' : 'text-gray-500') : ''}
                    ${(!selectedPlayer || loadingTournaments) ? 
                      (isDarkMode ? 'text-gray-400' : 'text-gray-500') : ''}
                  `}
                >
                  {getTournamentSelectText()}
                </SelectTrigger>
                {playerTournaments.length > 0 && (
                  <SelectContent
                    ref={(ref) => {
                      if (ref) {
                        ref.style.backgroundColor = isDarkMode ? 'rgb(31, 41, 55)' : 'white';
                        ref.style.borderColor = isDarkMode ? 'rgb(55, 65, 81)' : '';
                      }
                    }}
                  >
                    {playerTournaments.map((tournament) => (
                      <SelectItem 
                        key={tournament.eventId} 
                        value={tournament.eventId}
                        className={`
                          ${isDarkMode ? 'text-gray-200 data-[highlighted]:bg-gray-700 data-[highlighted]:text-white' : 'text-gray-900 data-[highlighted]:bg-gray-100'}
                          cursor-pointer
                        `}
                      >
                        {tournament.eventId.replace('epicgames_', '').replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                )}
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Stats Display */}
        {loading ? (
          <Card className={`animate-pulse ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-6">
              <div className={`h-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </CardContent>
          </Card>
        ) : playerStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Eliminations',
                icon: <Crosshair className="h-5 w-5 text-red-500" />,
                value: playerStats.eliminations,
                subtext: `Rank #${playerStats.eliminationsRank}`
              },
              {
                title: 'Assists',
                icon: <Heart className="h-5 w-5 text-green-500" />,
                value: playerStats.assists,
                subtext: `Rank #${playerStats.assistsRank}`
              },
              {
                title: 'Shots/Headshots',
                icon: <Target className="h-5 w-5 text-blue-500" />,
                value: playerStats.shots,
                subtext: `${formatNumber(playerStats.headshots)} headshots`
              },
              {
                title: 'Hits to Players',
                icon: <Zap className="h-5 w-5 text-yellow-500" />,
                value: playerStats.hitsToPlayers
              },
              {
                title: 'Damage to Players',
                icon: <Swords className="h-5 w-5 text-purple-500" />,
                value: playerStats.damageToPlayers
              },
              {
                title: 'Health Taken',
                icon: <Activity className="h-5 w-5 text-orange-500" />,
                value: playerStats.healthTaken
              }
            ].map((stat, index) => (
              <Card key={index} className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                    {stat.icon}
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : ''}`}>
                    {formatNumber(stat.value)}
                  </div>
                  {stat.subtext && (
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.subtext}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Card className={`col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Damage Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : ''}`}>
                  {playerStats.damageRatio.toFixed(2)}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Damage dealt vs taken
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FortniteStatsDisplay;
