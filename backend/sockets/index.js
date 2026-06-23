module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connecté : ${socket.id}`);

    socket.on('rejoindre_vendeur', (vendeurId) => {
      socket.join(`vendeur_${vendeurId}`);
    });

    socket.on('rejoindre_client', (clientId) => {
      socket.join(`client_${clientId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket déconnecté : ${socket.id}`);
    });
  });
};
