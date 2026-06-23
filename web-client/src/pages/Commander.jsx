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

  if (!boutique) return <p className="text-muted mt-2">Chargement…</p>;

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
      {/* Barre de progression */}
      <div style={{ display: 'flex', gap: 5, marginBottom: '1.75rem' }}>
        {ETAPES.slice(0, 4).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 3,
            background: i <= etape ? '#E0A516' : 'rgba(61,47,35,0.12)',
            transition: 'background 0.3s ease',
          }} />
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
              style={{
                cursor: 'pointer',
                border: tarifChoisi?._id === t._id ? '2px solid #E0A516' : '1px solid rgba(61,47,35,0.12)',
                background: tarifChoisi?._id === t._id ? 'rgba(224,165,22,0.04)' : undefined,
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <strong style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{t.label}</strong>
              <p style={{ color: '#E0A516', fontWeight: 700, marginTop: 4 }}>
                {t.prixUnitaire.toLocaleString('fr-FR')} FCFA
                <span style={{ color: '#8B7355', fontWeight: 400, fontSize: '.875rem' }}> / plateau</span>
              </p>
            </div>
          ))}
          <button className="btn-primary" disabled={!tarifChoisi} onClick={() => setEtape(1)}>Suivant</button>
        </>
      )}

      {etape === 1 && (
        <>
          <h1>Quantité</h1>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="flex items-center" style={{ gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-secondary" style={{ width: 48, height: 48, padding: 0, fontSize: '1.25rem', borderRadius: 12 }}
                onClick={() => setNbPlateaux(Math.max(1, nbPlateaux - 1))}>−</button>
              <input
                type="number" min={1} max={stock}
                value={nbPlateaux}
                onChange={e => setNbPlateaux(Math.min(stock, Math.max(1, Number(e.target.value))))}
                style={{ textAlign: 'center', width: 80, fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.5rem', fontWeight: 700 }}
              />
              <button className="btn-secondary" style={{ width: 48, height: 48, padding: 0, fontSize: '1.25rem', borderRadius: 12 }}
                onClick={() => setNbPlateaux(Math.min(stock, nbPlateaux + 1))}>+</button>
            </div>
            <p className="text-muted" style={{ marginTop: 8 }}>Stock : {stock} plateaux disponibles</p>
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: '1.5rem', color: '#E0A516', marginTop: 12 }}>
              {montantTotal.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          <button className="btn-primary" onClick={() => setEtape(2)}>Suivant</button>
        </>
      )}

      {etape === 2 && (
        <>
          <h1>Mode de réception</h1>
          {[['livraison', 'Livraison', 'Je reçois les plateaux chez moi'],
            ['retrait', 'Retrait sur place', boutique.disponibilites?.adressePointVente || 'Adresse communiquée par le vendeur']
          ].map(([val, titre, desc]) => (
            <div
              key={val}
              className="card"
              onClick={() => setModeReception(val)}
              style={{
                cursor: 'pointer',
                border: modeReception === val ? '2px solid #E0A516' : '1px solid rgba(61,47,35,0.12)',
                background: modeReception === val ? 'rgba(224,165,22,0.04)' : undefined,
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <strong style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{titre}</strong>
              <p className="text-muted" style={{ marginTop: 4 }}>{desc}</p>
            </div>
          ))}
          {modeReception === 'livraison' && (
            <div className="form-group">
              <label>Où vous livre-t-on ?</label>
              <input placeholder="Ex : Calavi, derrière le carrefour X" value={lieuLivraison} onChange={e => setLieuLivraison(e.target.value)} required />
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
            {[
              ['Tarif', `${tarifChoisi.label} — ${tarifChoisi.prixUnitaire.toLocaleString('fr-FR')} FCFA/plateau`],
              ['Quantité', `${nbPlateaux} plateau${nbPlateaux > 1 ? 'x' : ''}`],
              ['Mode', modeReception === 'livraison' ? 'Livraison' : 'Retrait'],
              ...(modeReception === 'livraison' ? [['Lieu', lieuLivraison]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between" style={{ padding: '6px 0', borderBottom: '1px solid rgba(61,47,35,0.07)' }}>
                <span className="text-muted">{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div className="flex justify-between" style={{ paddingTop: 12, marginTop: 4 }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: '1.2rem', color: '#E0A516' }}>
                {montantTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn-primary" onClick={confirmerCommande}>Confirmer la commande</button>
        </>
      )}

      {etape === 4 && commande && (
        <>
          <h1>Commande enregistrée</h1>
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                <circle cx="24" cy="24" r="23" stroke="#3A7D44" strokeWidth="2"/>
                <path d="M14 24L21 31L34 17" stroke="#3A7D44" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>
              Commande enregistrée !
            </p>
            <p className="text-muted">En attente de confirmation. Contactez le vendeur pour finaliser le paiement.</p>
          </div>
          <a
            href={lienWhatsApp(boutique.vendeur.whatsapp, messageCommande(commande, boutique.disponibilites?.adressePointVente))}
            target="_blank" rel="noopener noreferrer"
          >
            <button className="btn-whatsapp mt-1">Contacter le vendeur sur WhatsApp</button>
          </a>
          <button className="btn-secondary mt-1" onClick={() => navigate('/commandes')} style={{ width: '100%', marginTop: 10 }}>
            Voir mes commandes
          </button>
        </>
      )}
    </div>
  );
}
