import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

import 'react-toastify/dist/ReactToastify.css';

export default class Main extends Component {
  notifyError = () => toast.error('Repositório não encontrado!', {
    position: toast.POSITION.TOP_RIGHT,
    containerId: 'repositoryNotFound'
  });

  notifyRepositoryExists = () => toast.warn('Não é possível duplicar o repositório!', {
    position: toast.POSITION.TOP_RIGHT,
    containerId: 'repositoryExists'
  });

  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    repoExists: true,
  };

  /**
   * Carregar os dados do localStorage
   */
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  /**
   * Salvar os dados do localStorage
   */
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  }

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { newRepo, repositories } = this.state;

      repositories.forEach((repo) => {
        if (repo.name === newRepo) {
          console.error(new Error('Repositório duplicado!'));

          throw "repositoryExists";
        }
      });

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        id: response.data.id,
        name: response.data.full_name
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        repoExists: true,
      });

    } catch (err) {
      this.setState({ repoExists: false });

      if (err === 'repositoryExists') {
        this.notifyRepositoryExists();
      } else {
        this.notifyError();
      }
    }
    this.setState({ loading: false });
  }

  render() {
    const { newRepo, repositories, loading, repoExists } = this.state;

    return (
      <Container>
        <ToastContainer enableMultiContainer containerId={'repositoryNotFound'} />
        <ToastContainer enableMultiContainer containerId={'repositoryExists'} />
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} repoExists={repoExists}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? <FaSpinner color="#FFF" size={14} /> : <FaPlus color="#FFF" size={14} />}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={String(repository.id)}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
