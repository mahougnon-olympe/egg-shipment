import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { lienWhatsApp, messageCommande } from '../../../shared/whatsapp';

const ETAPES = ['tarif', 'quantite', 'reception', 'recap', 'confirmation'];

export default function Commander({ user }) {
  const [etape, setEtape] = useState(0);
  const [boutique, setBoutique] = useState(null);
  const [tarifChoisi, setTarifChoisi] = useState(null);
  const [nbPlateaux, setNbPlateaux] = useState(1);
  const [modeReception, setModeReception] = useState('livraison');
  const [lieuLivraison, setLieuLivraison] = useState('');
  const [commande, setCommande] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/boutique').then(setBoutique).catch(e => setError(e.message));
  }, []);

  if (!boutique) return <p className="mt-2">Chargement…</p>;

  const stock = boutique.stock.soldeDisponible;
  const montantTotal = tarifChoisi ? nbPlateaux * tarifChoisi.prixUnitaire : 0;

  const confirmerCommande = async () => {
    setError('');
    try {
      const c = await api.post('/commandes', {
        tarifId: tarifChoisi._id,
        nbPlateaux,
        modeReception,
        lieuLivraison: modeReception === 'livraison' ? lieuLivraison : undefined,
      });
      setCommande({ ...c, tarifLabel: tarifChoisi.label, clientPrenom: user.prenom, clientNom: user.nom, clientWhatsapp: user.whatsapp });
      setEtape(4);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
        {ETAPES.slice(0, 4).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= etape ? '#F97316' : '#E5E7EB' }} />
        ))}
      </div>

      {etape === 0 && (
        <>
          <h1>Choisir un tarif</h1>
          {boutique.tarifs.map(t => (
            <div
              key={t._id}
              className="card"
              onClick={() => setTarifChoisi(t)}
              style={{ cursor: 'pointer', border: tarifChoisi?._id === t._id ? '2px solid #F97316' : '2px solid transparent' }}
            >
              <strong>{t.label}</strong>
              <p style={{ color: '#F97316', fontWeight: 700 }}>{t.prixUnitaire.toLocaleString('fr-FR')} FCFA / plateau</p>
            </div>
          ))}
          <button className="btn-primary" disabled={!tarifChoisi} onClick={() => setEtape(1)}>Suivant</button>
        </>
      )}

      {etape === 1 && (
        <>
          <h1>Quantité</h1>
          <div className="card">
            <div className="flex items-center" style={{ gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setNbPlateaux(Math.max(1, nbPlateaux - 1))}>−</button>
              <input
                type="number" min={1} max={stock}
                value={nbPlateaux}
                onChange={e => setNbPlateaux(Math.min(stock, Math.max(1, Number(e.target.value))))}
                style={{ textAlign: 'center', width: 80 }}
              />
              <button className="btn-secondary" onClick={() => setNbPlateaux(Math.min(stock, nbPlateaux + 1))}>+</button>
            </div>
            <p className="mt-1" style={{ color: '#6B7280' }}>Stock : {stock} plateaux</p>
            <p style={{ fontWeight: 700, fontSize: '1.2rem', marginTop: 8 }}>
              Total : {montantTotal.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          <button className="btn-primary" onClick={() => setEtape(2)}>Suivant</button>
        </>
      )}

      {etape === 2 && (
        <>
          <h1>Mode de réception</h1>
          <div className="card" style={{ cursor: 'pointer', border: modeReception === 'livraison' ? '2px solid #F97316' : '2px solid transparent' }} onClick={() => setModeReception('livraison')}>
            <strong>🚚 Livraison</strong>
            <p style={{ color: '#6B7280', fontSize: '.9rem' }}>Je reçois les plateaux chez moi</p>
          </div>
          <div className="card" style={{ cursor: 'pointer', border: modeReception === 'retrait' ? '2px solid #F97316' : '2px solid transparent' }} onClick={() => setModeReception('retrait')}>
            <strong>🏪 Retrait sur place</strong>
            <p style={{ color: '#6B7280', fontSize: '.9rem' }}>{boutique.disponibilites?.adressePointVente || 'Adresse communiquée par le vendeur'}</p>
          </div>
          {modeReception === 'livraison' && (
            <div className="form-group">
              <label>Lieu de livraison</label>
              <input placeholder="Ex: Calavi, derrière le carrefour X" value={lieuLivraison} onChange={e => setLieuLivraison(e.target.value)} required />
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button className="btn-primary" disabled={modeReception === 'livraison' && !lieuLivraison.trim()} onClick={() => setEtape(3)}>Suivant</button>
        </>
      )}

      {etape === 3 && (
        <>
          <h1>Récapitulatif</h1>
          <div className="card">
            <p><strong>Tarif :</strong> {tarifChoisi.label} — {tarifChoisi.prixUnitaire.toLocaleString('fr-FR')} FCFA/plateau</p>
            <p><strong>Quantité :</strong> {nbPlateaux} plateau{nbPlateaux > 1 ? 'x' : ''}</p>
            <p><strong>Montant total :</strong> <span style={{ color: '#F97316', fontWeight: 700 }}>{montantTotal.toLocaleString('fr-FR')} FCFA</span></p>
            <p><strong>Mode :</strong> {modeReception === 'livraison' ? 'Livraison' : 'Retrait'}</p>
            {modeReception === 'livraison' && <p><strong>Lieu :</strong> {lieuLivraison}</p>}
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn-primary" onClick={confirmerCommande}>Confirmer la commande</button>
        </>
      )}

      {etape === 4 && commande && (
        <>
          <h1>Commande enregistrée !</h1>
          <div className="card">
            <p>Votre commande est enregistrée et en attente de confirmation.</p>
            <p className="mt-1" style={{ color: '#6B7280', fontSize: '.85rem' }}>Contactez le vendeur pour finaliser le paiement et la livraison.</p>
          </div>
          <a
            href={lienWhatsApp(boutique.vendeur.whatsapp, messageCommande(commande, boutique.disponibilites?.adressePointVente))}
            target="_blank" rel="noopener noreferrer"
          >
            <button className="btn-whatsapp mt-1">Contacter le vendeur sur WhatsApp</button>
          </a>
          <button className="btn-secondary mt-1" onClick={() => navigate('/commandes')} style={{ width: '100%', marginTop: 8 }}>
            Voir mes commandes
          </button>
        </>
      )}
    </div>
  );
}
