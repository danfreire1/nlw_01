import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

import './style.css';

import logo from '../../assets/logo.svg';

//sempre que é criado um estado para um array uou objeto é preciso informar manualmente o tipo da variavel

interface Item {
    id: number;
    titulo: string;
    imagem_url: string;
}

interface IBGEUF {
    sigla: string;
}

interface IBGECidades {
    nome: string;
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cidades, setCidades] = useState<string[]>([]);

    const [posicaoInicial, setPosicaoInicial] = useState<[number, number]>([0, 0]);

    const [inputData, setInputData] = useState({
        nome: '',
        email: '',
        whatsapp: '',
    });

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCidade, setSelectedCidade] = useState('0');
    const [selectedPosicao, setSelectedPosicao] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(posicao => {
            const { latitude, longitude } = posicao.coords;

            setPosicaoInicial([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufsIBGE = response.data.map(uf => uf.sigla);

            setUfs(ufsIBGE);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }

        axios.get<IBGECidades[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const nomeCidades = response.data.map(cidade => cidade.nome);

            setCidades(nomeCidades);
        });
    }, [selectedUf]);

    function ufSelecionada(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function cidadeSelecionada(event: ChangeEvent<HTMLSelectElement>) {
        const cidade = event.target.value;

        setSelectedCidade(cidade);
    }

    function pontoMapaSelecionado(event: LeafletMouseEvent) {
        setSelectedPosicao([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function valorInputs(event: ChangeEvent<HTMLInputElement>) {
       const { name, value } = event.target;

        setInputData({ ...inputData, [name]: value });
    }

    function itemSelecionado(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0) {
            const itemsFiltrados = selectedItems.filter(item => item !== id);

            setSelectedItems(itemsFiltrados);
        } else {
            setSelectedItems([ ...selectedItems, id ]);
        }

        
    }

    async function submitPage(event: FormEvent) {
        event.preventDefault();

        const { nome, email, whatsapp } = inputData;
        const uf = selectedUf;
        const cidade = selectedCidade;
        const [ latitude, longitude ] = selectedPosicao;
        const items = selectedItems;

        const data = {
            nome,
            email,
            whatsapp,
            uf,
            cidade,
            latitude,
            longitude,
            items
        };

        await api.post('points', data);

        alert('Ponto de coleta cadastrado com sucesso!');

        history.push('/');
    }

    return (
      <div id="page-create-point">
          <header>
                <img src={logo} alt="Ecoleta" />
         
                <Link to ="/" >
                    <FiArrowLeft />
                    Voltar para home
                </Link>
          </header>

          <form onSubmit={submitPage}>
              <h1>Cadastro do <br/> ponto de coleta</h1>
    
              <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="nome">Nome da entidade</label>
                        <input type="text" name="nome" id="nome" onChange={valorInputs} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="text" name="email" id="email" onChange={valorInputs} />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={valorInputs} />
                        </div>
                    </div>
              </fieldset>

              <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={posicaoInicial} zoom={15} onClick={pontoMapaSelecionado}>
                        <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosicao} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={ufSelecionada}>
                                <option value="0">Selecione uma UF*</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select name="cidade" id="cidade" value={selectedCidade} onChange={cidadeSelecionada}>
                                <option value="0">Selecione uma cidade*</option>
                                {cidades.map(cidade => (
                                    <option key={cidade} value={cidade}>{cidade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
              </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => itemSelecionado(item.id)} 
                            className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <span>{item.titulo}</span> 
                            </li>
                        ))};
                        
                    </ul>
                </fieldset>

              <button type="submit">Cadastrar ponto de coleta</button>
          </form>
      </div>  
    );
}

export default CreatePoint;